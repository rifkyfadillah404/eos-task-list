import express from 'express';
import { getPool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a task
// Authorization: user from same department OR admin
router.get('/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const pool = getPool();


    // Check if user has access to this task (same department OR admin)
    if (req.user.role !== 'admin') {
      const taskCheck = await pool.request()
        .input('taskId', taskId)
        .input('userId', req.user.id)
        .query(`
          SELECT t.id, u.department_id, req_user.department_id as requester_dept
          FROM tasks t
          JOIN users u ON t.user_id = u.id
          JOIN users req_user ON req_user.id = @userId
          WHERE t.id = @taskId
        `);

      if (taskCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const task = taskCheck.recordset[0];
      if (task.department_id !== task.requester_dept) {
        return res.status(403).json({ error: 'Access denied: Task from different department' });
      }
    }

    // Get all comments for this task with user info
    const result = await pool.request()
      .input('taskId', taskId)
      .query(`
        SELECT 
          c.id,
          c.task_id,
          c.user_id,
          c.comment_text,
          c.created_at,
          u.name as user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = @taskId
        ORDER BY c.created_at ASC
      `);


    res.json({ 
      comments: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to a task
// Authorization: user from same department OR admin
router.post('/:taskId', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment_text } = req.body;


    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const pool = getPool();

    // Check if user has access to this task (same department OR admin)
    if (req.user.role !== 'admin') {
      const taskCheck = await pool.request()
        .input('taskId', taskId)
        .input('userId', req.user.id)
        .query(`
          SELECT t.id, u.department_id, req_user.department_id as requester_dept
          FROM tasks t
          JOIN users u ON t.user_id = u.id
          JOIN users req_user ON req_user.id = @userId
          WHERE t.id = @taskId
        `);

      if (taskCheck.recordset.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const task = taskCheck.recordset[0];
      if (task.department_id !== task.requester_dept) {
        return res.status(403).json({ error: 'Access denied: Task from different department' });
      }
    }

    // Insert comment
    const result = await pool.request()
      .input('taskId', taskId)
      .input('userId', req.user.id)
      .input('commentText', comment_text.trim())
      .query(`
        INSERT INTO comments (task_id, user_id, comment_text)
        VALUES (@taskId, @userId, @commentText);
        
        SELECT 
          c.id,
          c.task_id,
          c.user_id,
          c.comment_text,
          c.created_at,
          u.name as user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = SCOPE_IDENTITY();
      `);

    const newComment = result.recordset[0];

    res.status(201).json({ 
      comment: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment
// Authorization: comment owner OR admin
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const pool = getPool();


    // Check if comment exists and user has permission
    const commentCheck = await pool.request()
      .input('commentId', commentId)
      .query(`
        SELECT c.id, c.user_id
        FROM comments c
        WHERE c.id = @commentId
      `);

    if (commentCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = commentCheck.recordset[0];

    // Only comment owner or admin can delete
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Not comment owner' });
    }

    // Delete comment
    await pool.request()
      .input('commentId', commentId)
      .query(`DELETE FROM comments WHERE id = @commentId`);


    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
