import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['PDF', 'Guide', 'Checklist'], default: 'PDF' },
  category: { type: String },          // e.g. "Career Planning", "Resume Writing"
  tags: [String],                      // e.g. "Beginner", "Scholarship", "Skill-Building"
  fileUrl: { type: String, required: true }, // link to the actual downloadable file
  downloadCount: { type: Number, default: 0 }, // increases every time someone downloads
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Model name 'Resource' -> collection name becomes 'resources'
export default mongoose.model('Resource', schema);