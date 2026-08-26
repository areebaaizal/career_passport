import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import { protect } from '../middleware/auth.js'; // assumes existing JWT/session middleware attaching req.user.id

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

/* ------------------------------------------------------------------ */
/* Resume upload config                                                */
/* ------------------------------------------------------------------ */
const RESUME_DIR = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(RESUME_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUME_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX files are allowed'));
  },
});

/* Helper: safely JSON.parse fields that may arrive as strings (FormData) or objects (JSON body) */
const parseMaybeJSON = (v, fallback) => {
  if (v === undefined || v === null) return fallback;
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

/* ------------------------------------------------------------------ */
/* GET /auth/profile — full profile for the logged-in user             */
/* ------------------------------------------------------------------ */
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('bookmarks');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user, completeness: user.getProfileCompleteness() });
});

/* ------------------------------------------------------------------ */
/* PUT /auth/profile — update any/all sections in one call             */
/* Accepts either application/json or multipart/form-data (resume).    */
/* Mount: app.use('/auth/profile', require('./routes/profile'))        */
/* ------------------------------------------------------------------ */
router.put('/', protect, upload.single('resume'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const b = req.body;

    // --- Basic info ---
    if (b.name !== undefined) user.name = b.name;
    if (b.phone !== undefined) user.phone = b.phone;
    if (b.role !== undefined) user.role = b.role;
    if (b.location !== undefined) user.location = b.location;
    if (b.dateOfBirth !== undefined) user.dateOfBirth = b.dateOfBirth || undefined;
    if (b.profilePicture !== undefined) user.profilePicture = b.profilePicture;

    // --- Education ---
    if (b.education !== undefined) {
      user.education = { ...user.education.toObject(), ...parseMaybeJSON(b.education, {}) };
    }

    // --- Skills ---
    if (b.skills !== undefined) {
      user.skills = { ...user.skills.toObject(), ...parseMaybeJSON(b.skills, {}) };
    }

    // --- Interests & preferences ---
    if (b.interests !== undefined) {
      user.interests = { ...user.interests.toObject(), ...parseMaybeJSON(b.interests, {}) };
    }

    // --- Career goals ---
    if (b.careerGoals !== undefined) {
      user.careerGoals = { ...user.careerGoals.toObject(), ...parseMaybeJSON(b.careerGoals, {}) };
    }

    // --- Social links ---
    if (b.socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks.toObject(), ...parseMaybeJSON(b.socialLinks, {}) };
    }

    // --- Resume (plain path string, matching the schema) ---
    if (b.removeResume === 'true' || b.removeResume === true) {
      if (user.resume) {
        fs.unlink(path.join(RESUME_DIR, path.basename(user.resume)), () => {});
      }
      user.resume = undefined;
    } else if (req.file) {
      if (user.resume) {
        fs.unlink(path.join(RESUME_DIR, path.basename(user.resume)), () => {});
      }
      user.resume = `/uploads/resumes/${req.file.filename}`;
    }
    if (b.resumeVisibility !== undefined) {
      user.resumeVisibility = b.resumeVisibility;
    }

    await user.save();
    res.json({ user, completeness: user.getProfileCompleteness(), message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update profile.' });
  }
});

/* ------------------------------------------------------------------ */
/* Work experience — dedicated sub-resource CRUD (array of jobs)       */
/* ------------------------------------------------------------------ */
router.post('/experience', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.experience.push(req.body);
  await user.save();
  res.status(201).json({ experience: user.experience });
});

router.put('/experience/:entryId', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  const entry = user.experience.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  Object.assign(entry, req.body);
  await user.save();
  res.json({ experience: user.experience });
});

router.delete('/experience/:entryId', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.experience.id(req.params.entryId)?.deleteOne();
  await user.save();
  res.json({ experience: user.experience });
});

/* ------------------------------------------------------------------ */
/* Recently viewed — call this from career/video/resource detail pages */
/* ------------------------------------------------------------------ */
router.post('/recently-viewed', protect, async (req, res) => {
  const { itemType, itemId } = req.body;
  const user = await User.findById(req.user.id);
  user.recentlyViewed = user.recentlyViewed.filter((v) => String(v.itemId) !== String(itemId));
  user.recentlyViewed.unshift({ itemType, itemId, viewedAt: new Date() });
  user.recentlyViewed = user.recentlyViewed.slice(0, 20);
  await user.save();
  res.json({ recentlyViewed: user.recentlyViewed });
});

export default router;