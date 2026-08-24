import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],                 // multiple choice options
  correctAnswer: { type: Number, required: true }, // index of correct option
  careerTags: [String]               // careers this question is linked to, used for recommendation
}, { timestamps: true });

// Model name 'Quiz' -> MongoDB collection name automatically becomes 'quizzes'
export default mongoose.model('Quiz', schema);