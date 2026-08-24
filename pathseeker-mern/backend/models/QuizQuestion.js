import mongoose from 'mongoose';
const schema=new mongoose.Schema({question:String,options:[String],correctAnswer:Number,careerTags:[String]});
export default mongoose.model('QuizQuestion',schema);
