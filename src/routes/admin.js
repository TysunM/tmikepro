import express from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// ... (other admin routes) ...

/**
 * [NEW] Update a project's status
 * This powers the admin-facing project progress bar.
 */
router.put('/projects/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status against the enum
  const validStatuses = [
    'intake', 'in_progress', 'static_mix', 'final_mix', 
    'mastered', 'review', 'revisions', 'delivered'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid project status' });
  }

  const { rows } = await pool.query(
    'UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // [NEW] If status is 'delivered', trigger loyalty service
  if (status === 'delivered') {
    const { user_id } = rows[0];
    // This is an async call, no need to await it
    loyaltyService.handleProjectCompletion(user_id)
      .catch(console.error); // Log errors
  }

  res.json(rows[0]);
}));

export default router;
