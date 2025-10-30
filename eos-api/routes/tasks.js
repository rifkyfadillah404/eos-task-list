import express from 'express';
import { getPool } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks (for admin) or user's tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    let query = '';
    let request = pool.request();

    if (req.user.role === 'admin') {
      // Admin can see all tasks with user info
      query = `
        SELECT
          t.id, t.user_id, t.title, t.description, t.priority,
          t.category, t.due_date, t.status, t.created_at,
          u.name as user_name
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
      `;
    } else {
      // Users can see their own tasks with user info
      query = `
        SELECT
          t.id, t.user_id, t.title, t.description, t.priority,
          t.category, t.due_date, t.status, t.created_at,
          u.name as user_name
        FROM tasks t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = @userId
        ORDER BY t.created_at DESC
      `;
      request.input('userId', req.user.id);
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
    const { title, description, priority, category, due_date, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const pool = getPool();

    const result = await pool.request()
      .input('user_id', req.user.id)
      .input('title', title)
      .input('description', description || '')
      .input('priority', priority || 'medium')
      .input('category', category || 'General')
      .input('due_date', due_date || null)
      .input('status', status || 'todo')
      .query(`
        INSERT INTO tasks (user_id, title, description, priority, category, due_date, status)
        VALUES (@user_id, @title, @description, @priority, @category, @due_date, @status);
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
        status
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
    const { title, description, priority, category, due_date, status } = req.body;

    const pool = getPool();

    // Check task ownership
    const task = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT user_id FROM tasks WHERE id = @id');

    if (task.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.recordset[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
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
      request.input('due_date', due_date);
    }
    if (status !== undefined) {
      updateFields.push('status = @status');
      request.input('status', status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = GETDATE()');

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

    // Check task ownership
    const task = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT user_id FROM tasks WHERE id = @id');

    if (task.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.recordset[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
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
