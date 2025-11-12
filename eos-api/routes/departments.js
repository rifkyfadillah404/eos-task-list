import express from 'express';
import { getPool } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// List departments (auth required)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT id, name, code, created_at, updated_at FROM departments ORDER BY name
    `);
    res.json({ success: true, departments: result.recordset });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create department (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const pool = getPool();

    // Check for duplicate department name
    const duplicateCheck = await pool.request()
      .input('name', name)
      .query(`
        SELECT id FROM departments 
        WHERE LOWER(name) = LOWER(@name)
      `);

    if (duplicateCheck.recordset.length > 0) {
      return res.status(409).json({ error: 'A department with this name already exists' });
    }

    const result = await pool.request()
      .input('name', name)
      .input('code', code || null)
      .query(`
        INSERT INTO departments (name, code)
        VALUES (@name, @code);
        SELECT SCOPE_IDENTITY() as id;
      `);

    const newId = result.recordset[0].id;
    res.status(201).json({ success: true, department: { id: newId, name, code: code || null } });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update department (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const pool = getPool();

    // Check for duplicate department name (excluding current department)
    if (name !== undefined) {
      const duplicateCheck = await pool.request()
        .input('name', name)
        .input('id', parseInt(id))
        .query(`
          SELECT id FROM departments 
          WHERE LOWER(name) = LOWER(@name)
          AND id != @id
        `);

      if (duplicateCheck.recordset.length > 0) {
        return res.status(409).json({ error: 'A department with this name already exists' });
      }
    }

    let updateFields = [];
    const request = pool.request().input('id', parseInt(id));
    if (name !== undefined) { updateFields.push('name = @name'); request.input('name', name); }
    if (code !== undefined) { updateFields.push('code = @code'); request.input('code', code || null); }
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    updateFields.push('updated_at = GETUTCDATE()');

    const result = await request.query(`
      UPDATE departments SET ${updateFields.join(', ')} WHERE id = @id;
      SELECT id, name, code FROM departments WHERE id = @id;
    `);
    const updated = result.recordset[0];
    if (!updated) { return res.status(404).json({ error: 'Department not found' }); }

    res.json({ success: true, department: updated });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete department (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Ensure no users or jobs reference this department
    const checkUsers = await pool.request().input('id', parseInt(id)).query('SELECT TOP 1 id FROM users WHERE department_id = @id');
    if (checkUsers.recordset.length > 0) {
      return res.status(400).json({ error: 'Department is in use by users' });
    }
    const checkJobs = await pool.request().input('id', parseInt(id)).query('SELECT TOP 1 id FROM jobs WHERE department_id = @id');
    if (checkJobs.recordset.length > 0) {
      return res.status(400).json({ error: 'Department is in use by jobs' });
    }

    await pool.request().input('id', parseInt(id)).query('DELETE FROM departments WHERE id = @id');
    res.json({ success: true });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

