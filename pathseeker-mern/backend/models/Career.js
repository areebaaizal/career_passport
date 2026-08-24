import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:String,domain:String,description:String,skills:[String],salary:Number,demand:{type:String,enum:['Low','Medium','High'],default:'Medium'},education:String},{timestamps:true});
export default mongoose.model('Career',schema);
