import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'podcast'], default: 'video' },
  url: { type: String, required: true },   // embed link or audio link
  description: { type: String },
  category: { type: String },              // e.g. "Interview Tips", "Skill Building"
  tags: [String],
  transcript: { type: String },            // shown/toggled on the VideoDetails page
  ratingAvg: { type: Number, default: 0 }, // average of all ratings, recalculated on each new rating
  ratingCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Model name 'Multimedia' -> collection name manually set to 'multimedia'
// (Mongoose would otherwise auto-pluralize this to 'multimedias', which does not match the spec)
export default mongoose.model('Multimedia', schema, 'multimedia');