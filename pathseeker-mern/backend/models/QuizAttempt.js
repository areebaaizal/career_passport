import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  total: Number,
  percentage: Number,           // score/total*100, saved for quick display in history
  recommendedCareers: [String]
}, { timestamps: true });

export default mongoose.model('QuizAttempt', schema);