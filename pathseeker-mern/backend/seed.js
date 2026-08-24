import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Career from './models/Career.js';
import Quiz from './models/Quiz.js';
import Content from './models/Content.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pathseeker');
  console.log('Connected to database...');

  // Clear old data so re-running seed.js doesn't create duplicates
  await Career.deleteMany({});
  await Quiz.deleteMany({});

  // Create admin user only if it doesn't already exist
  const existingAdmin = await User.findOne({ email: 'admin@pathseeker.com' });
  if (!existingAdmin) {
    await User.create({
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

  // Sample content/resources
  await Content.deleteMany({});
  await Content.insertMany([
    {
      title: 'Getting Started with Web Development',
      type: 'article',
      url: 'https://developer.mozilla.org/',
      description: 'Web development learning resource',
      tags: ['Beginner', 'Skill-Building']
    }
  ]);
  console.log('Content seeded.');

  console.log('Seed complete!');
  process.exit();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});