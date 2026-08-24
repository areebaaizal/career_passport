import Career from '../models/Career.js';
export const list=async(req,res)=>{try{const q={};if(req.query.domain)q.domain=req.query.domain;if(req.query.demand)q.demand=req.query.demand;if(req.query.search)q.$or=[{title:new RegExp(req.query.search,'i')},{description:new RegExp(req.query.search,'i')}];res.json(await Career.find(q).sort({createdAt:-1}))}catch(e){res.status(500).json({message:e.message})}};
export const getOne=async(req,res)=>{const x=await Career.findById(req.params.id);x?res.json(x):res.status(404).json({message:'Career not found'})};
export const create=async(req,res)=>res.status(201).json(await Career.create(req.body));
export const update=async(req,res)=>res.json(await Career.findByIdAndUpdate(req.params.id,req.body,{new:true}));
export const remove=async(req,res)=>{await Career.findByIdAndDelete(req.params.id);res.json({message:'Career deleted'})};
