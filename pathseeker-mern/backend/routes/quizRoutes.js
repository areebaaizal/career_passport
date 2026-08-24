import { Router } from 'express';
import { questions, submit, history, resultById } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const r = Router();

// Order matters: /history must come before /result/:id so Express doesn't
// confuse "history" with an :id parameter
r.get('/questions', questions);
r.post('/submit', protect, submit);
r.get('/history', protect, history);
r.get('/result/:id', protect, resultById);

export default r;