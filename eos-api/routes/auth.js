import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password required' });
    }

    const pool = getPool();
    const result = await pool.request()
      .input('userId', userId)
      .query('SELECT * FROM users WHERE userId = @userId');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    // For demo: simple password comparison
    // In production, use bcrypt to compare hashed passwords
    const validPassword = password === 'user123' || password === 'admin123' ||
                         (user.password && await bcrypt.compare(password, user.password));

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        userId: user.userId,
        role: user.role,
        department_id: user.department_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', req.user.id)
      .query('SELECT id, name, userId, role, department_id FROM users WHERE id = @id');

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

export default router;
