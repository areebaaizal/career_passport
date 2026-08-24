import Notification from '../models/Notification.js';
export const list=async(req,res)=>res.json(await Notification.find({user:req.user.id}).sort({createdAt:-1}));
export const read=async(req,res)=>{const n=await Notification.findOneAndUpdate({_id:req.params.id,user:req.user.id},{isRead:true},{new:true});n?res.json(n):res.status(404).json({message:'Notification not found'});};
export const readAll=async(req,res)=>{await Notification.updateMany({user:req.user.id},{isRead:true});res.json({message:'All notifications marked as read'});};
export const remove=async(req,res)=>{await Notification.findOneAndDelete({_id:req.params.id,user:req.user.id});res.json({message:'Notification removed'});};
