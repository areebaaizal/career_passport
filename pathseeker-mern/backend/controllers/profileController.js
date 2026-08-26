import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESUME_DIR = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(RESUME_DIR, { recursive: true });

const parseMaybeJSON = (v, fallback) => {
  if (v === undefined || v === null) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

// Empty string / null / undefined -> undefined (so Mongoose skips the field
// instead of trying to Number("") and throwing a CastError on save).
const toNumOrUndef = (v) => {
  if (v === '' || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).populate('bookmarks');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user, completeness: user.getProfileCompleteness() });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const b = req.body;

    if (b.name !== undefined) user.name = b.name;
    if (b.phone !== undefined) user.phone = b.phone;
    if (b.role !== undefined) user.role = b.role;
    if (b.location !== undefined) user.location = b.location;
    if (b.dateOfBirth !== undefined) user.dateOfBirth = b.dateOfBirth || undefined;
    if (b.profilePicture !== undefined) user.profilePicture = b.profilePicture;

    if (b.education !== undefined) {
      const parsedEdu = parseMaybeJSON(b.education, {});
      if (parsedEdu.graduationYear !== undefined) {
        parsedEdu.graduationYear = toNumOrUndef(parsedEdu.graduationYear);
      }
      user.education = { ...user.education.toObject(), ...parsedEdu };
    }
    if (b.skills !== undefined) {
      user.skills = { ...user.skills.toObject(), ...parseMaybeJSON(b.skills, {}) };
    }
    if (b.interests !== undefined) {
      user.interests = { ...user.interests.toObject(), ...parseMaybeJSON(b.interests, {}) };
    }
    if (b.careerGoals !== undefined) {
      const parsedGoals = parseMaybeJSON(b.careerGoals, {});
      if (parsedGoals.desiredSalaryRange) {
        parsedGoals.desiredSalaryRange.min = toNumOrUndef(parsedGoals.desiredSalaryRange.min);
        parsedGoals.desiredSalaryRange.max = toNumOrUndef(parsedGoals.desiredSalaryRange.max);
      }
      user.careerGoals = { ...user.careerGoals.toObject(), ...parsedGoals };
    }
    if (b.socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks.toObject(), ...parseMaybeJSON(b.socialLinks, {}) };
    }

    if (b.removeResume === 'true' || b.removeResume === true) {
      if (user.resume) fs.unlink(path.join(RESUME_DIR, path.basename(user.resume)), () => {});
      user.resume = undefined;
    } else if (req.file) {
      if (user.resume) fs.unlink(path.join(RESUME_DIR, path.basename(user.resume)), () => {});
      user.resume = `/uploads/resumes/${req.file.filename}`;
    }
    if (b.resumeVisibility !== undefined) user.resumeVisibility = b.resumeVisibility;

    await user.save();
    res.json({ user, completeness: user.getProfileCompleteness(), message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update profile.' });
  }
};

export const addExperience = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.experience.push(req.body);
  await user.save();
  res.status(201).json({ experience: user.experience });
};

export const updateExperience = async (req, res) => {
  const user = await User.findById(req.user.id);
  const entry = user.experience.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  Object.assign(entry, req.body);
  await user.save();
  res.json({ experience: user.experience });
};

export const deleteExperience = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.experience.id(req.params.entryId)?.deleteOne();
  await user.save();
  res.json({ experience: user.experience });
};