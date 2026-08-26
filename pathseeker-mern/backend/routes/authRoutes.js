import { Router } from 'express';

import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

import {
  getProfile,
  updateProfile,
  addExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/profileController.js';

import { protect } from '../middleware/auth.js';

import { uploadResume } from '../middleware/upload.js';

const r = Router();


// ============================================================
// AUTHENTICATION
// ============================================================

// Register
r.post('/register', register);

// Login
r.post('/login', login);

// Forgot Password
r.post('/forgot-password', forgotPassword);

// Reset Password
r.put('/reset-password/:token', resetPassword);


// ============================================================
// PROFILE
// ============================================================

// Get profile
r.get(
  '/profile',
  protect,
  getProfile
);

// Update profile
r.put(
  '/profile',
  protect,
  uploadResume.single('resume'),
  updateProfile
);

// Add experience
r.post(
  '/profile/experience',
  protect,
  addExperience
);

// Update experience
r.put(
  '/profile/experience/:entryId',
  protect,
  updateExperience
);

// Delete experience
r.delete(
  '/profile/experience/:entryId',
  protect,
  deleteExperience
);


export default r;