# PathSeeker — MERN Career Passport

A professional MERN starter for the PathSeeker Career Passport SRS. It includes authentication, personalized dashboard, career bank, career details, quiz flow, resources/content, bookmarks, feedback, notifications, success stories, profile management and an admin panel.

## Stack
- React + Vite
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + bcryptjs
- Axios

## Project structure
```text
pathseeker-mern/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   └── server.js
├── frontend/
│   └── src/
├── .gitignore
└── README.md
```

## MongoDB Atlas setup
1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow your development IP in Atlas Network Access.
4. Copy `backend/.env.example` to `backend/.env`.
5. Put your Atlas connection string in `MONGO_URI`.

Example:
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/pathseeker
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Do not commit `.env` to GitHub.** The root `.gitignore` already excludes it.

## Run backend
```bash
cd backend
npm install
npm run dev
```

Backend: http://localhost:5000

## Run frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Important
`node seed.js` is **not required** for this version. MongoDB Atlas is used through the `.env` connection string. Careers and other content can be created through protected admin/API functionality.

## GitHub
From the project root:
```bash
git init
git add .
git commit -m "Initial PathSeeker MERN project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

`node_modules`, `.env`, build folders, logs and local uploads are excluded by `.gitignore`.
