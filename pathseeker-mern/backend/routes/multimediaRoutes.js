import { Router } from 'express';
import { list, getOne, rate, create, update, remove } from '../controllers/multimediaController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Public — anyone can browse and watch/listen
r.get('/', list);              // GET /api/multimedia (with search/category/type/tag filters)
r.get('/:id', getOne);         // GET /api/multimedia/:id

// Logged-in users can rate — must be logged in, but not admin-only
r.post('/:id/rating', protect, rate);  // POST /api/multimedia/:id/rating

// Admin-only content management
r.post('/', protect, adminOnly, create);
r.put('/:id', protect, adminOnly, update);
r.delete('/:id', protect, adminOnly, remove);

export default r;