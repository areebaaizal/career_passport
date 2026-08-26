import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Career from './models/Career.js';
import Quiz from './models/Quiz.js';
import Resource from './models/Resource.js';
import Multimedia from './models/Multimedia.js';
import SuccessStory from './models/SuccessStory.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pathseeker');
  console.log('Connected to database...');

  // Clear old data so re-running seed.js doesn't create duplicates
  await Career.deleteMany({});
  await Quiz.deleteMany({});
  await Resource.deleteMany({});
  await Multimedia.deleteMany({});
  await SuccessStory.deleteMany({});

  // Create admin user only if it doesn't already exist
  let admin = await User.findOne({ email: 'admin@pathseeker.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: 'admin@pathseeker.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'admin'
    });
    console.log('Admin user created (admin@pathseeker.com / Admin@123)');
  }

  // Sample careers with roadmap field included
  await Career.insertMany([
    {
      title: 'Full Stack Developer',
      domain: 'Technology',
      description: 'Build frontend and backend applications.',
      skills: ['React', 'Node.js', 'MongoDB'],
      salary: 120000,
      demand: 'High',
      education: 'Computer Science',
      roadmap: [
        "Learn HTML, CSS and JavaScript basics",
        "Learn a frontend framework like React",
        "Learn Node.js and Express for backend",
        "Learn a database like MongoDB or MySQL",
        "Build 2-3 full stack projects for your portfolio",
        "Apply for internships or junior roles"
      ]
    },
    {
      title: 'Data Analyst',
      domain: 'Data',
      description: 'Turn data into useful business insights.',
      skills: ['SQL', 'Excel', 'Python'],
      salary: 100000,
      demand: 'High',
      education: 'Computer Science/Business',
      roadmap: [
        "Learn Excel and basic statistics",
        "Learn SQL for querying databases",
        "Learn Python (Pandas, NumPy)",
        "Learn data visualization (Power BI / Tableau)",
        "Work on real datasets and build a portfolio",
        "Apply for data analyst internships"
      ]
    },
    {
      title: 'UI/UX Designer',
      domain: 'Design',
      description: 'Design useful and accessible digital products.',
      skills: ['Figma', 'Research', 'Prototyping'],
      salary: 90000,
      demand: 'Medium',
      education: 'Any',
      roadmap: [
        "Learn design fundamentals (color, typography, layout)",
        "Learn Figma or Adobe XD",
        "Study user research and usability testing",
        "Build wireframes and prototypes",
        "Create a design portfolio",
        "Apply for junior UI/UX roles"
      ]
    },
    {
      title: 'Digital Marketer',
      domain: 'Marketing',
      description: 'Plan and run online marketing campaigns.',
      skills: ['SEO', 'Content Writing', 'Social Media'],
      salary: 70000,
      demand: 'Medium',
      education: 'Any',
      roadmap: [
        "Learn SEO basics",
        "Learn social media marketing",
        "Learn Google Ads and Analytics",
        "Run a small campaign to gain experience",
        "Apply for marketing internships"
      ]
    }
  ]);
  console.log('Careers seeded.');

  // Sample quiz questions — careerTags must match the career "title" exactly
  await Quiz.insertMany([
    {
      question: 'Which activity do you enjoy most?',
      options: ['Coding', 'Analyzing data', 'Designing interfaces', 'Planning campaigns'],
      correctAnswer: 0,
      careerTags: ['Full Stack Developer']
    },
    {
      question: 'Which skill sounds most interesting to you?',
      options: ['React', 'SQL', 'Figma', 'SEO'],
      correctAnswer: 1,
      careerTags: ['Data Analyst']
    },
    {
      question: 'Which task would you rather do?',
      options: ['Build an API', 'Create a dashboard', 'Design a mobile screen', 'Write ad copy'],
      correctAnswer: 2,
      careerTags: ['UI/UX Designer']
    },
    {
      question: 'What excites you the most about work?',
      options: ['Solving logic problems', 'Finding patterns in numbers', 'Making things look good', 'Reaching more people online'],
      correctAnswer: 3,
      careerTags: ['Digital Marketer']
    }
  ]);
  console.log('Quiz questions seeded.');

  // Sample downloadable resources
  await Resource.insertMany([
    {
      title: 'Resume Writing Checklist',
      description: 'A step-by-step checklist to build a strong resume.',
      type: 'Checklist',
      category: 'Resume Writing',
      tags: ['Beginner', 'Skill-Building'],
      fileUrl: 'https://developer.mozilla.org/',
      createdBy: admin._id
    },
    {
      title: 'Complete Guide to Internship Applications',
      description: 'Everything you need to know before applying for internships.',
      type: 'Guide',
      category: 'Career Planning',
      tags: ['Beginner'],
      fileUrl: 'https://developer.mozilla.org/',
      createdBy: admin._id
    },
    {
      title: 'Scholarship Application Checklist',
      description: 'Key documents and deadlines to track for scholarships.',
      type: 'Checklist',
      category: 'Scholarships',
      tags: ['Scholarship'],
      fileUrl: 'https://developer.mozilla.org/',
      createdBy: admin._id
    }
  ]);
  console.log('Resources seeded.');

  // Sample videos and podcasts
  await Multimedia.insertMany([
    {
      title: 'How to Ace Your Technical Interview',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Practical tips for technical interview preparation.',
      category: 'Interview Tips',
      tags: ['Beginner'],
      transcript: 'In this video, we cover common technical interview questions and how to approach them step by step...',
      createdBy: admin._id
    },
    {
      title: 'A Day in the Life of a Data Analyst',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'See what a data analyst really does day to day.',
      category: 'Career Exploration',
      tags: ['Data'],
      transcript: 'Data analysts spend their day gathering data, cleaning it, and building reports for stakeholders...',
      createdBy: admin._id
    },
    {
      title: 'Career Conversations Podcast: Breaking into Tech',
      type: 'podcast',
      url: 'https://developer.mozilla.org/',
      description: 'A conversation with professionals who switched careers into tech.',
      category: 'Career Exploration',
      tags: ['Skill-Building'],
      transcript: 'Welcome to Career Conversations. Today we talk to three professionals about how they broke into tech...',
      createdBy: admin._id
    }
  ]);
  console.log('Multimedia seeded.');

  // Sample success stories (pre-approved so they show up immediately)
  await SuccessStory.insertMany([
    {
      user: admin._id,
      name: 'Sara Ahmed',
      title: 'From Marketing to Full Stack Development',
      story: 'I started in digital marketing but always loved solving problems with code. After 6 months of self-study and building projects, I landed my first developer role.',
      domain: 'Technology',
      status: 'approved'
    },
    {
      user: admin._id,
      name: 'Bilal Khan',
      title: 'How I Became a Data Analyst Without a CS Degree',
      story: 'With a business background, I learned SQL and Python on my own time. Consistency and small real-world projects made all the difference.',
      domain: 'Data',
      status: 'approved'
    }
  ]);
  console.log('Success stories seeded.');

  console.log('Seed complete!');
  process.exit();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});