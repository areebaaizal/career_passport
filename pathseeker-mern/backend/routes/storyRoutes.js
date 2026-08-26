import { Router } from 'express';
import { list, getOne, mine, create, pending, updateStatus } from '../controllers/storyController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Order matters: specific paths like /mine and /pending must come BEFORE
// /:id, otherwise Express will think "mine" or "pending" is an :id value
r.get('/mine', protect, mine);              // GET /api/stories/mine
r.get('/pending', protect, adminOnly, pending); // GET /api/stories/pending

r.get('/', list);                // GET /api/stories
r.post('/', protect, create);    // POST /api/stories
r.get('/:id', getOne);           // GET /api/stories/:id

r.put('/:id/status', protect, adminOnly, updateStatus); // approve/reject

export default r;