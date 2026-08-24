import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  description: { type: String },
  skills: [String],           // used for skill filter
  salary: { type: Number, default: 0 },   // expected annual salary, used for salary filter
  demand: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }, // job demand filter
  education: { type: String },
  roadmap: [String]           // step-by-step career roadmap shown on CareerDetails page
}, { timestamps: true });

export default mongoose.model('Career', schema);