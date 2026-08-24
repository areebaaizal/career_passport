import { Router } from 'express';
import { list, getOne, create, update, remove } from '../controllers/careerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Public routes — anyone can browse careers, no login needed
r.get('/', list);            // GET /api/careers  (with search/domain/skill/demand/salary filters)
r.get('/:id', getOne);       // GET /api/careers/:id

// Admin-only routes — must be logged in AND be an admin
r.post('/', protect, adminOnly, create);       // POST /api/careers
r.put('/:id', protect, adminOnly, update);     // PUT /api/careers/:id
r.delete('/:id', protect, adminOnly, remove);  // DELETE /api/careers/:id

export default r;