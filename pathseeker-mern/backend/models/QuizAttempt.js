import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},score:Number,total:Number,recommendedCareers:[String]},{timestamps:true});
export default mongoose.model('QuizAttempt',schema);
