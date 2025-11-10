import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get users - Updated to allow department filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    let query = '';
    const request = pool.request();

    if (req.user.role === 'admin') {
      query = `
        SELECT u.id, u.name, u.userId, u.role, u.created_at, u.department_id,
               d.name as department_name
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        ORDER BY u.created_at DESC
      `;
    } else {
      const userResult = await pool.request()
        .input('userId', req.user.id)
        .query('SELECT department_id FROM users WHERE id = @userId');
      
      const userDeptId = userResult.recordset[0]?.department_id;
      
      if (!userDeptId) {
        return res.json({ success: true, users: [] });
      }
      
      request.input('department_id', userDeptId);
      query = `
        SELECT u.id, u.name, u.userId, u.role, u.created_at, u.department_id,
               d.name as department_name
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.department_id = @department_id
        ORDER BY u.created_at DESC
      `;
    }

    const result = await request.query(query);

    res.json({
      success: true,
      users: result.recordset
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile, admins can view anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pool = getPool();
    const result = await pool.request()
      .input('id', parseInt(id))
      .query(`
        SELECT u.id, u.name, u.userId, u.role, u.created_at, u.department_id,
               d.name as department_name
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.id = @id
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add user (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, userId, password, role, department_id } = req.body;

    if (!name || !userId || !password) {
      return res.status(400).json({ error: 'Name, user ID, and password required' });
    }

    const pool = getPool();

    // Check if userId already exists
    const checkUserId = await pool.request()
      .input('userId', userId)
      .query('SELECT id FROM users WHERE userId = @userId');

    if (checkUserId.recordset.length > 0) {
      return res.status(400).json({ error: 'User ID already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.request()
      .input('name', name)
      .input('userId', userId)
      .input('password', hashedPassword)
      .input('role', role || 'user')
      .input('department_id', department_id || null)
      .query(`
        INSERT INTO users (name, userId, password, role, department_id)
        VALUES (@name, @userId, @password, @role, @department_id);
        SELECT SCOPE_IDENTITY() as id;
      `);

    const newUserId = result.recordset[0].id;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUserId,
        name,
        userId,
        role: role || 'user',
        department_id: department_id || null
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, userId, password, role, department_id } = req.body;

    const pool = getPool();

    // Build update query dynamically
    let updateFields = [];
    let request = pool.request();
    request.input('id', parseInt(id));

    if (name) {
      updateFields.push('name = @name');
      request.input('name', name);
    }
    if (userId) {
      updateFields.push('userId = @userId');
      request.input('userId', userId);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = @password');
      request.input('password', hashedPassword);
    }
    if (role) {
      updateFields.push('role = @role');
      request.input('role', role);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = @department_id');
      request.input('department_id', department_id || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = GETDATE()');

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = @id;
      SELECT u.id, u.name, u.userId, u.role, u.department_id, d.name as department_name
      FROM users u LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.id = @id;
    `;

    const result = await request.query(query);
    const updatedUser = result.recordset[0];

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const pool = getPool();

    // Check if user exists
    const checkUser = await pool.request()
      .input('id', parseInt(id))
      .query('SELECT id FROM users WHERE id = @id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await pool.request()
      .input('id', parseInt(id))
      .query('DELETE FROM users WHERE id = @id');

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
