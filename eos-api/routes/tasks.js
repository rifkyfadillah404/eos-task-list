import express from 'express';
import { getPool } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks (for admin) or department tasks (for users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    let query = '';
    let request = pool.request();

    if (req.user.role === 'admin') {
      query = `
        SELECT t.id, t.user_id, t.title, t.description, t.priority,
               t.category, t.due_date, t.status, t.created_at, t.job_id,
               t.plan_by, t.completed_by, t.completed_date,
               u.name as user_name,
               planner.name as plan_by_name,
               completer.name as completed_by_name,
               (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users planner ON t.plan_by = planner.id
        LEFT JOIN users completer ON t.completed_by = completer.id
        ORDER BY t.created_at DESC
      `;
    } else {
      const userResult = await pool.request()
        .input('userId', req.user.id)
        .query('SELECT department_id FROM users WHERE id = @userId');
      
      const userDeptId = userResult.recordset[0]?.department_id;
      
      if (!userDeptId) {
        query = `
          SELECT t.id, t.user_id, t.title, t.description, t.priority,
                 t.category, t.due_date, t.status, t.created_at, t.job_id,
                 t.plan_by, t.completed_by, t.completed_date,
                 u.name as user_name,
                 planner.name as plan_by_name,
                 completer.name as completed_by_name,
                 (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
          FROM tasks t
          JOIN users u ON t.user_id = u.id
          LEFT JOIN users planner ON t.plan_by = planner.id
          LEFT JOIN users completer ON t.completed_by = completer.id
          WHERE t.user_id = @userId
          ORDER BY t.created_at DESC
        `;
        request.input('userId', req.user.id);
      } else {
        query = `
          SELECT t.id, t.user_id, t.title, t.description, t.priority,
                 t.category, t.due_date, t.status, t.created_at, t.job_id,
                 t.plan_by, t.completed_by, t.completed_date,
                 u.name as user_name,
                 planner.name as plan_by_name,
                 completer.name as completed_by_name,
                 (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
          FROM tasks t
          JOIN users u ON t.user_id = u.id
          LEFT JOIN users planner ON t.plan_by = planner.id
          LEFT JOIN users completer ON t.completed_by = completer.id
          WHERE u.department_id = @departmentId
          ORDER BY t.created_at DESC
        `;
        request.input('departmentId', userDeptId);
      }
    }

    const result = await request.query(query);

    res.json({
      success: true,
      tasks: result.recordset
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT * FROM tasks WHERE id = @id');

    const task = result.recordset[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ success: true, task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, category, due_date, status, job_id, user_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const pool = getPool();
    
    // For admin: can assign to any user, otherwise assign to self
    const assignedUserId = req.user.role === 'admin' && user_id ? user_id : req.user.id;

    // Parse due_date to proper format for SQL Server
    let parsedDueDate = null;
    if (due_date) {
      try {
        parsedDueDate = new Date(due_date.replace(' ', 'T')).toISOString();
      } catch (err) {
        parsedDueDate = null;
      }
    }

    const result = await pool.request()
      .input('user_id', assignedUserId)
      .input('title', title)
      .input('description', description || '')
      .input('priority', priority || 'medium')
      .input('category', category || 'General')
      .input('due_date', parsedDueDate)
      .input('status', status || 'todo')
      .input('job_id', job_id || null)
      .input('plan_by', req.user.id)
      .query(`
        INSERT INTO tasks (user_id, title, description, priority, category, due_date, status, job_id, plan_by)
        VALUES (@user_id, @title, @description, @priority, @category, @due_date, @status, @job_id, @plan_by);
        SELECT SCOPE_IDENTITY() as id;
      `);

    const newTaskId = result.recordset[0].id;

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: {
        id: newTaskId,
        user_id: req.user.id,
        title,
        description,
        priority,
        category,
        due_date,
        status,
        job_id: job_id || null
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category, due_date, status, job_id } = req.body;

    const pool = getPool();

    // Check task ownership or same department
    const taskQuery = await pool.request()
      .input('id', parseInt(id))
      .query(`
        SELECT t.user_id, t.status as current_status, u.department_id 
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = @id
      `);

    if (taskQuery.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskQuery.recordset[0];

    // Authorization: admin, task owner, or same department member
    if (req.user.role !== 'admin') {
      if (task.user_id !== req.user.id) {
        // Check if same department
        const userDept = await pool.request()
          .input('userId', req.user.id)
          .query('SELECT department_id FROM users WHERE id = @userId');
        
        if (!userDept.recordset[0] || userDept.recordset[0].department_id !== task.department_id) {
          return res.status(403).json({ error: 'Unauthorized - not in same department' });
        }
      }
    }

    // Build update query
    let updateFields = [];
    let request = pool.request();
    request.input('id', parseInt(id));

    if (title !== undefined) {
      updateFields.push('title = @title');
      request.input('title', title);
    }
    if (description !== undefined) {
      updateFields.push('description = @description');
      request.input('description', description);
    }
    if (priority !== undefined) {
      updateFields.push('priority = @priority');
      request.input('priority', priority);
    }
    if (category !== undefined) {
      updateFields.push('category = @category');
      request.input('category', category);
    }
    if (due_date !== undefined) {
      updateFields.push('due_date = @due_date');
      let parsedDueDate = null;
      if (due_date) {
        try {
          parsedDueDate = new Date(due_date.replace(' ', 'T')).toISOString();
        } catch (err) {
          parsedDueDate = null;
        }
      }
      request.input('due_date', parsedDueDate);
    }
    if (status !== undefined) {
      updateFields.push('status = @status');
      request.input('status', status);
      
      // If status changed to completed, set completed_by and completed_date
      if (status === 'completed' && task.current_status !== 'completed') {
        updateFields.push('completed_by = @completed_by');
        updateFields.push('completed_date = GETUTCDATE()');
        request.input('completed_by', req.user.id);
      }
      // If status changed from completed to other status, reset completed_by and completed_date
      else if (status !== 'completed' && task.current_status === 'completed') {
        updateFields.push('completed_by = NULL');
        updateFields.push('completed_date = NULL');
      }
    }
    if (job_id !== undefined) {
      updateFields.push('job_id = @job_id');
      request.input('job_id', job_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = GETUTCDATE()');

    const query = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = @id;
      SELECT * FROM tasks WHERE id = @id;
    `;

    const result = await request.query(query);
    const updatedTask = result.recordset[0];

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check task creator
    const task = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT plan_by FROM tasks WHERE id = @id');

    if (task.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the creator (plan_by) can delete the task
    if (task.recordset[0].plan_by !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized - only task creator can delete' });
    }

    // Delete task
    await pool.request()
      .input('id', parseInt(id))
      .query('DELETE FROM tasks WHERE id = @id');

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get task statistics (for admin)
router.get('/stats/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
      FROM tasks
    `);

    res.json({
      success: true,
      stats: result.recordset[0]
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
