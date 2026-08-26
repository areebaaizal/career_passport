import express from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import { protect } from '../middleware/auth.js'; // same middleware used by routes/profile.js

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

/* ------------------------------------------------------------------ */
/* PUT /auth/change-password                                           */
/* Body: { currentPassword, newPassword }                              */
/* ------------------------------------------------------------------ */
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not change password.' });
  }
});

/* ------------------------------------------------------------------ */
/* DELETE /auth/account                                                */
/* Body: { password }                                                  */
/* ------------------------------------------------------------------ */
router.delete('/account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required to confirm account deletion.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Clean up the resume file on disk, if any (resume is a plain path string)
    if (user.resume) {
      const resumePath = path.join(__dirname, '..', user.resume.replace(/^\//, ''));
      fs.unlink(resumePath, () => {}); // best-effort, ignore errors
    }

    // If bookmarks / quiz history live in their own collections rather than
    // embedded on the user, delete them here too, e.g.:
    // await QuizAttempt.deleteMany({ user: user._id });

    await user.deleteOne();

    res.json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not delete account.' });
  }
});

export default router;