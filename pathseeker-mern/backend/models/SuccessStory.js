import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, name:String, title:{type:String,required:true},
  story:{type:String,required:true}, domain:String, image:String,
  status:{type:String,enum:['pending','approved','rejected'],default:'pending'}
},{timestamps:true});
export default mongoose.model('SuccessStory',schema);
