import { Router } from 'express';
import { list, getOne, create, update, remove } from '../controllers/resourceController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Public — anyone can browse and open resources
r.get('/', list);           // GET /api/resources (with search/category/tag filters)
r.get('/:id', getOne);      // GET /api/resources/:id (also counts as a download)

// Admin-only
r.post('/', protect, adminOnly, create);       // POST /api/resources
r.put('/:id', protect, adminOnly, update);     // PUT /api/resources/:id
r.delete('/:id', protect, adminOnly, remove);  // DELETE /api/resources/:id

export default r;