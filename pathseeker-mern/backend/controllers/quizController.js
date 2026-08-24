import QuizQuestion from '../models/QuizQuestion.js'; import QuizAttempt from '../models/QuizAttempt.js';
export const questions=async(req,res)=>res.json(await QuizQuestion.find().select('-correctAnswer'));
export const submit=async(req,res)=>{const {answers=[]}=req.body;const qs=await QuizQuestion.find();let score=0,tags=[];answers.forEach((a,i)=>{if(qs[i]&&Number(a)===qs[i].correctAnswer){score++;tags.push(...qs[i].careerTags)}});const recommended=[...new Set(tags)].slice(0,5);const attempt=await QuizAttempt.create({user:req.user.id,score,total:qs.length,recommendedCareers:recommended});res.json({score,total:qs.length,recommendedCareers:recommended,attemptId:attempt._id})};
export const history=async(req,res)=>res.json(await QuizAttempt.find({user:req.user.id}).sort({createdAt:-1}));
