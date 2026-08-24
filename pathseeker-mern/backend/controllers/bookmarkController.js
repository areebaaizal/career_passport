import Bookmark from '../models/Bookmark.js';
export const list=async(req,res)=>res.json(await Bookmark.find({user:req.user.id}));
export const add=async(req,res)=>res.status(201).json(await Bookmark.create({...req.body,user:req.user.id}));
export const update=async(req,res)=>res.json(await Bookmark.findOneAndUpdate({_id:req.params.id,user:req.user.id},{note:req.body.note},{new:true}));
export const remove=async(req,res)=>{await Bookmark.findOneAndDelete({_id:req.params.id,user:req.user.id});res.json({message:'Removed'})};
