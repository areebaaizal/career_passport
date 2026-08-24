import SuccessStory from '../models/SuccessStory.js';
export const list=async(req,res)=>res.json(await SuccessStory.find({status:'approved'}).sort({createdAt:-1}));
export const mine=async(req,res)=>res.json(await SuccessStory.find({user:req.user.id}).sort({createdAt:-1}));
export const create=async(req,res)=>res.status(201).json(await SuccessStory.create({...req.body,user:req.user.id}));
export const pending=async(req,res)=>res.json(await SuccessStory.find({status:'pending'}).populate('user','name email').sort({createdAt:-1}));
export const updateStatus=async(req,res)=>{const s=await SuccessStory.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});s?res.json(s):res.status(404).json({message:'Story not found'});};
