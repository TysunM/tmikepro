import { pool } from '../db.js';
import { sendEmail } from '../mail.js';

/**
 * Handles logic for when a user completes a project.
 * Increments their project count and checks for milestone rewards.
 */
async function handleProjectCompletion(userId) {
  console.log(`Handling project completion for user ${userId}`);
  
  // 1. Increment loyalty counter
  const { rows: loyaltyRows } = await pool.query(
    `INSERT INTO loyalty (user_id, projects_completed, last_project_completed_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET projects_completed = loyalty.projects_completed + 1,
         last_project_completed_at = NOW()
     RETURNING *`,
    [userId]
  );
  
  const loyalty = loyaltyRows[0];
  console.log(`User ${userId} now has ${loyalty.projects_completed} completed projects.`);

  // 2. Check for active project milestone promotions
  const { rows: promoRows } = await pool.query(
    `SELECT * FROM promotions 
     WHERE type = 'project_milestone' 
     AND project_milestone_count = $1 
     AND is_active = TRUE`,
    [loyalty.projects_completed]
  );

  if (promoRows.length === 0) {
    return; // No promotion for this milestone
  }

  const promotion = promoRows[0];
  const user = await getUserById(userId);

  // 3. Grant a voucher
  const voucherCode = `${promotion.voucher_code_prefix}-${userId}-${Date.now()}`.slice(0, 50);
  const voucherDescription = promotion.description;
  
  await pool.query(
    `INSERT INTO vouchers (user_id, promotion_id, code, description, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 year')`,
    [userId, promotion.id, voucherCode, voucherDescription]
  );

  console.log(`Granted voucher ${voucherCode} to user ${userId} for promotion ${promotion.name}`);

  // 4. Notify user via email
  await sendEmail({
    to: user.email,
    subject: `You've earned a reward!`,
    text: `Hi ${user.name},\n\nCongratulations on completing ${loyalty.projects_completed} projects with us! As a thank you, you've earned a voucher for: ${voucherDescription}.\n\nYour voucher code is: ${voucherCode}\n\nWe appreciate your business!\n\nTysun Mike Pro`,
    html: `<p>Hi ${user.name},</p><p>Congratulations on completing <strong>${loyalty.projects_completed} projects</strong> with us! As a thank you, you've earned a voucher for: <strong>${voucherDescription}</strong>.</p><p>Your voucher code is: <strong>${voucherCode}</strong></p><p>We appreciate your business!<br>Tysun Mike Pro</p>`
  });
}

// ... (Add functions for referrals and birthdays) ...

async function getUserById(userId) {
  const { rows } = await pool.query('SELECT email, name FROM users WHERE id = $1', [userId]);
  return rows[0];
}

export const loyaltyService = {
  handleProjectCompletion
};
