import Feedback from '../models/Feedback.js';
export const create=async(req,res)=>res.status(201).json(await Feedback.create({...req.body,user:req.user.id}));
export const mine=async(req,res)=>res.json(await Feedback.find({user:req.user.id}).sort({createdAt:-1}));
export const all=async(req,res)=>res.json(await Feedback.find().populate('user','name email').sort({createdAt:-1}));
export const respond=async(req,res)=>res.json(await Feedback.findByIdAndUpdate(req.params.id,{response:req.body.response,status:'resolved'},{new:true}));
