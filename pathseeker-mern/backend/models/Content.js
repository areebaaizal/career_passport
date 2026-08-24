import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:String,type:{type:String,enum:['video','article','podcast','resource']},url:String,description:String,tags:[String],downloads:{type:Number,default:0}},{timestamps:true});
export default mongoose.model('Content',schema);
