import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // who submitted the story
  name: { type: String },              // display name shown on the story card
  title: { type: String, required: true },
  story: { type: String, required: true },
  domain: { type: String },            // used for domain filtering (e.g. Technology, Design)
  image: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } // admin approval needed
}, { timestamps: true });

// Model name 'SuccessStory' -> collection name automatically becomes 'successstories'
export default mongoose.model('SuccessStory', schema);