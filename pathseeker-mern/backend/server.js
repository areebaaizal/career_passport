import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import path from 'path';
import accountRoutes from './routes/Account.js';
dotenv.config();
const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'})); app.use(express.json()); app.use('/uploads',express.static('uploads'));
app.get('/api/health',(req,res)=>res.json({message:'PathSeeker API is running'}));
app.use('/api/auth',authRoutes); app.use('/api/careers',careerRoutes); app.use('/api/quiz',quizRoutes);
app.use('/api/bookmarks',bookmarkRoutes); app.use('/api/feedback',feedbackRoutes); app.use('/api/content',contentRoutes); app.use('/api/admin',adminRoutes); app.use('/api/notifications',notificationRoutes); app.use('/api/stories',storyRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/auth', accountRoutes);


const PORT=process.env.PORT||5000;
async function ensureAdmin(){
  if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD) return;
  const existing=await User.findOne({email:process.env.ADMIN_EMAIL.toLowerCase()});
  if(!existing){await User.create({name:'PathSeeker Admin',email:process.env.ADMIN_EMAIL.toLowerCase(),password:await bcrypt.hash(process.env.ADMIN_PASSWORD,10),role:'admin'});console.log('Admin account created from environment settings.');}
}
mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/pathseeker').then(async()=>{await ensureAdmin();app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`))}).catch(e=>{console.error(e);process.exit(1)});
