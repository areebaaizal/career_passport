import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

// GET /api/quiz/questions
// Correct answer hidden from response so user cannot cheat
export const questions = async (req, res) => {
  try {
    const qs = await Quiz.find().select('-correctAnswer');
    res.json(qs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/quiz/submit
// Body: { answers: [0,2,1,...] }  -> index of chosen option per question
export const submit = async (req, res) => {
  try {
    const { answers = [] } = req.body;
    const qs = await Quiz.find();

    let score = 0;
    let tags = [];

    answers.forEach((a, i) => {
      if (qs[i] && Number(a) === qs[i].correctAnswer) {
        score++;
        tags.push(...qs[i].careerTags);
      }
    });

    const total = qs.length;
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const recommendedCareers = [...new Set(tags)].slice(0, 5);

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      score,
      total,
      percentage,
      recommendedCareers
    });

    res.json({
      attemptId: attempt._id,
      score,
      total,
      percentage,
      recommendedCareers
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/quiz/history
// Returns all past attempts of the logged in user, most recent first
export const history = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/quiz/result/:id
// Returns a single quiz attempt by its id (for the QuizResult.jsx page)
export const resultById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Result not found' });

    // Only the owner of this attempt can view it
    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to view this result' });
    }

    res.json(attempt);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};