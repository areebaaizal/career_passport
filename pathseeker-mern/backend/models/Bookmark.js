import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},itemType:String,itemId:mongoose.Schema.Types.ObjectId,note:String},{timestamps:true});
export default mongoose.model('Bookmark',schema);
