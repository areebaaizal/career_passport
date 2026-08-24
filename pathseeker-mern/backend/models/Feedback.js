import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},type:{type:String,enum:['bug','suggestion','query']},message:String,status:{type:String,default:'pending'},response:String},{timestamps:true});
export default mongoose.model('Feedback',schema);
