import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,email:{type:String,unique:true},password:String,role:{type:String,enum:['student','graduate','professional','admin'],default:'student'},education:String,skills:[String],interests:[String],experience:String,resume:String},{timestamps:true});
export default mongoose.model('User',schema);
