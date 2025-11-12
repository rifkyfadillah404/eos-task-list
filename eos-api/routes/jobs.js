import express from 'express';
import { getPool } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get jobs
// - Admin: can see all jobs (optionally filter by department)
// - User: can only see jobs created by admins (optionally filter by department)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const { department, department_id } = req.query;

    let query = '';
    const request = pool.request();

    if (department_id) {
      request.input('department_id', parseInt(department_id));
    } else {
    }

    if (req.user.role === 'admin') {
      query = `
        SELECT 
          j.id, j.category, j.parent, j.sub_parent, j.department_id, d.name as department_name, j.created_at, j.updated_at
        FROM jobs j
        LEFT JOIN departments d ON d.id = j.department_id
        ${department_id ? 'WHERE j.department_id = @department_id' : ''}
        ORDER BY j.category
      `;
    } else {
      query = `
        SELECT 
          j.id, j.category, j.parent, j.sub_parent, j.department_id, d.name as department_name, j.created_at, j.updated_at
        FROM jobs j
        JOIN users u ON u.id = j.user_id
        LEFT JOIN departments d ON d.id = j.department_id
        WHERE u.role = 'admin' ${department_id ? 'AND j.department_id = @department_id' : ''}
        ORDER BY j.category
      `;
    }

    const result = await request.query(query);

    res.json({
      success: true,
      jobs: result.recordset
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get single job
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    let query = '';
    const request = pool.request().input('id', parseInt(id));

    if (req.user.role === 'admin') {
      query = `
        SELECT 
          j.id, j.category, j.parent, j.sub_parent, j.department_id, d.name as department_name, j.created_at, j.updated_at
        FROM jobs j
        LEFT JOIN departments d ON d.id = j.department_id
        WHERE j.id = @id
      `;
    } else {
      query = `
        SELECT 
          j.id, j.category, j.parent, j.sub_parent, j.department_id, d.name as department_name, j.created_at, j.updated_at
        FROM jobs j
        JOIN users u ON u.id = j.user_id
        LEFT JOIN departments d ON d.id = j.department_id
        WHERE j.id = @id AND u.role = 'admin'
      `;
    }

    const result = await request.query(query);

    const job = result.recordset[0];

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create job
// Create job (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category, parent, sub_parent, department_id } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!department_id) {
      return res.status(400).json({ error: 'Department is required' });
    }

    const pool = getPool();

    // If parent is provided, validate that it exists
    if (parent) {
      const parentCheck = await pool.request()
        .input('parent', parseInt(parent))
        .query('SELECT id FROM jobs WHERE id = @parent');

      if (parentCheck.recordset.length === 0) {
        return res.status(400).json({ error: 'Parent job not found' });
      }
    }

    // Check for duplicates
    const duplicateCheck = await pool.request()
      .input('category', category)
      .input('parent', parent ? parseInt(parent) : null)
      .input('department_id', parseInt(department_id))
      .query(`
        SELECT id FROM jobs 
        WHERE LOWER(category) = LOWER(@category) 
        AND (parent = @parent OR (parent IS NULL AND @parent IS NULL))
        AND department_id = @department_id
      `);

    if (duplicateCheck.recordset.length > 0) {
      let errorMessage = '';
      if (!parent) {
        errorMessage = 'This category name already exists in the selected department';
      } else {
        const parentJob = await pool.request()
          .input('parentId', parseInt(parent))
          .query('SELECT parent FROM jobs WHERE id = @parentId');
        
        if (parentJob.recordset.length > 0 && parentJob.recordset[0].parent === null) {
          errorMessage = 'This parent name already exists under the selected category';
        } else {
          errorMessage = 'This sub-parent name already exists under the selected parent';
        }
      }
      return res.status(409).json({ error: errorMessage });
    }

    const result = await pool.request()
      .input('user_id', req.user.id)
      .input('category', category)
      .input('parent', parent ? parseInt(parent) : null)
      .input('sub_parent', sub_parent || null)
      .input('department_id', parseInt(department_id))
      .query(`
        INSERT INTO jobs (user_id, category, parent, sub_parent, department_id)
        VALUES (@user_id, @category, @parent, @sub_parent, @department_id);
        SELECT SCOPE_IDENTITY() as id;
      `);

    const newJobId = result.recordset[0].id;

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: {
        id: newJobId,
        user_id: req.user.id,
        category,
        parent: parent ? parseInt(parent) : null,
        sub_parent: sub_parent || null,
        department_id: parseInt(department_id)
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update job (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, parent, sub_parent, department_id } = req.body;

    const pool = getPool();

    // Check if job exists
    const job = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT id, category, parent, department_id FROM jobs WHERE id = @id');

    if (job.recordset.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    const currentJob = job.recordset[0];

    // If parent is provided, validate that it exists
    if (parent) {
      const parentCheck = await pool.request()
        .input('parent', parseInt(parent))
        .query('SELECT id FROM jobs WHERE id = @parent');

      if (parentCheck.recordset.length === 0) {
        return res.status(400).json({ error: 'Parent job not found' });
      }
    }

    // Check for duplicates (only if category, parent, or department_id is being changed)
    const newCategory = category !== undefined ? category : currentJob.category;
    const newParent = parent !== undefined ? (parent ? parseInt(parent) : null) : currentJob.parent;
    const newDepartmentId = department_id !== undefined ? parseInt(department_id) : currentJob.department_id;

    const duplicateCheck = await pool.request()
      .input('category', newCategory)
      .input('parent', newParent)
      .input('department_id', newDepartmentId)
      .input('currentId', parseInt(id))
      .query(`
        SELECT id FROM jobs 
        WHERE LOWER(category) = LOWER(@category) 
        AND (parent = @parent OR (parent IS NULL AND @parent IS NULL))
        AND department_id = @department_id
        AND id != @currentId
      `);

    if (duplicateCheck.recordset.length > 0) {
      let errorMessage = '';
      if (!newParent) {
        errorMessage = 'This category name already exists in the selected department';
      } else {
        const parentJob = await pool.request()
          .input('parentId', newParent)
          .query('SELECT parent FROM jobs WHERE id = @parentId');
        
        if (parentJob.recordset.length > 0 && parentJob.recordset[0].parent === null) {
          errorMessage = 'This parent name already exists under the selected category';
        } else {
          errorMessage = 'This sub-parent name already exists under the selected parent';
        }
      }
      return res.status(409).json({ error: errorMessage });
    }

    // Build update query
    let updateFields = [];
    let request = pool.request();
    request.input('id', parseInt(id));

    if (category !== undefined) {
      updateFields.push('category = @category');
      request.input('category', category);
    }
    if (parent !== undefined) {
      updateFields.push('parent = @parent');
      request.input('parent', parent ? parseInt(parent) : null);
    }
    if (sub_parent !== undefined) {
      updateFields.push('sub_parent = @sub_parent');
      request.input('sub_parent', sub_parent);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = @department_id');
      request.input('department_id', department_id ? parseInt(department_id) : null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = GETUTCDATE()');

    const query = `
      UPDATE jobs
      SET ${updateFields.join(', ')}
      WHERE id = @id;
      SELECT j.*, d.name as department_name FROM jobs j LEFT JOIN departments d ON d.id = j.department_id WHERE j.id = @id;
    `;

    const result = await request.query(query);
    const updatedJob = result.recordset[0];

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete job (admin only) - with cascade delete for hierarchy
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if job exists
    const job = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT id FROM jobs WHERE id = @id');

    if (job.recordset.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Recursive function to get all child job IDs
    async function getAllChildJobIds(parentId) {
      const childIds = [parentId];
      
      // Find direct children
      const children = await pool.request()
        .input('parent', parentId)
        .query('SELECT id FROM jobs WHERE parent = @parent');
      
      // Recursively get all descendants
      for (const child of children.recordset) {
        const descendants = await getAllChildJobIds(child.id);
        childIds.push(...descendants);
      }
      
      return childIds;
    }

    // Get all job IDs to delete (including children)
    const jobIdsToDelete = await getAllChildJobIds(parseInt(id));
    
    console.log('Jobs to delete (cascade):', jobIdsToDelete);

    // Delete all tasks that reference any of these jobs
    if (jobIdsToDelete.length > 0) {
      const jobIdsString = jobIdsToDelete.join(',');
      await pool.request()
        .query(`DELETE FROM tasks WHERE job_id IN (${jobIdsString})`);
      
      console.log('Deleted tasks for jobs:', jobIdsString);
    }

    // Delete all jobs (children first, then parent)
    // Reverse the array to delete children before parents
    const reversedIds = [...jobIdsToDelete].reverse();
    for (const jobId of reversedIds) {
      await pool.request()
        .input('jobId', jobId)
        .query('DELETE FROM jobs WHERE id = @jobId');
    }

    res.json({
      success: true,
      message: `Job and ${jobIdsToDelete.length - 1} child job(s) deleted successfully`,
      deletedJobs: jobIdsToDelete.length,
      deletedJobIds: jobIdsToDelete
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: error.message });
  }
});



export default router;
