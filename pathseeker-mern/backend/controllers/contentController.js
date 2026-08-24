import Content from '../models/Content.js';
export const list=async(req,res)=>res.json(await Content.find().sort({createdAt:-1}));
export const create=async(req,res)=>res.status(201).json(await Content.create(req.body));
export const update=async(req,res)=>res.json(await Content.findByIdAndUpdate(req.params.id,req.body,{new:true}));
export const remove=async(req,res)=>{await Content.findByIdAndDelete(req.params.id);res.json({message:'Content deleted'})};
