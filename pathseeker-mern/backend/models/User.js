import mongoose from 'mongoose';

const { Schema } = mongoose;

/* ------------------------------------------------------------------ */
/* Sub-schemas                                                         */
/* ------------------------------------------------------------------ */

const EducationSchema = new Schema(
  {
    highestQualification: { type: String, default: '' },
    degreeProgram: { type: String, default: '' },
    institute: { type: String, default: '' },
    major: { type: String, default: '' },
    graduationYear: { type: Number },
    currentStatus: {
      type: String,
      enum: ['ongoing', 'completed', 'gap-year', ''],
      default: '',
    },
    certifications: [{ type: String }],
  },
  { _id: false }
);

const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 50 },
  },
  { _id: false }
);

const SkillsSchema = new Schema(
  {
    technical: [SkillSchema],
    soft: [SkillSchema],
    programmingLanguages: [SkillSchema],
    toolsAndTech: [SkillSchema],
  },
  { _id: false }
);

const InterestsSchema = new Schema(
  {
    areas: [{ type: String }], // Web Development, AI/ML, Cyber Security, etc.
    preferredDomains: [{ type: String }],
    preferredJobRoles: [{ type: String }],
    workPreference: { type: String, enum: ['remote', 'on-site', 'hybrid', ''], default: '' },
    preferredIndustry: [{ type: String }],
  },
  { _id: false }
);

const ExperienceEntrySchema = new Schema({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance', ''],
    default: '',
  },
  startDate: { type: Date },
  endDate: { type: Date }, // null/undefined => "Present"
  responsibilities: { type: String, default: '' },
  skillsUsed: [{ type: String }],
});

const CareerGoalsSchema = new Schema(
  {
    shortTerm: { type: String, default: '' },
    longTerm: { type: String, default: '' },
    targetJobRole: { type: String, default: '' },
    targetIndustry: { type: String, default: '' },
    desiredSalaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'PKR' },
    },
    preferredCountryRegion: { type: String, default: '' },
    careerLevel: { type: String, enum: ['entry', 'mid', 'senior', ''], default: '' },
  },
  { _id: false }
);

const QuizSummarySchema = new Schema(
  {
    latestScore: { type: Number },
    interestCategory: { type: String, default: '' },
    recommendedDomains: [{ type: String }],
    attemptsCount: { type: Number, default: 0 },
    lastAttemptDate: { type: Date },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    other: [{ label: String, url: String }],
  },
  { _id: false }
);

/* ------------------------------------------------------------------ */
/* Main schema — original field names kept as-is (name, email,        */
/* password, role, resume, resumeVisibility); education/skills/        */
/* interests/experience upgraded from flat String/[String] to          */
/* structured sub-documents.                                           */
/* ------------------------------------------------------------------ */

const schema = new mongoose.Schema(
  {
    // --- Basic information ---
    profilePicture: { type: String, default: '' },
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: { type: String, default: '' },
    role: { type: String, enum: ['student', 'graduate', 'professional', 'admin'], default: 'student' },
    location: { type: String, default: '' },
    dateOfBirth: { type: Date },

    // --- Education (was: String) ---
    education: { type: EducationSchema, default: () => ({}) },

    // --- Skills (was: [String]) ---
    skills: { type: SkillsSchema, default: () => ({}) },

    // --- Interests & career preferences (was: [String]) ---
    interests: { type: InterestsSchema, default: () => ({}) },

    // --- Work experience (was: String) — now an array of jobs ---
    experience: [ExperienceEntrySchema],

    // --- Career goals (new section) ---
    careerGoals: { type: CareerGoalsSchema, default: () => ({}) },

    // --- Resume — kept as a plain path/filename String, as before ---
    resume: String,
    resumeVisibility: { type: String, enum: ['public', 'private'], default: 'private' },

    // --- Quiz & assessment summary ---
    quizSummary: { type: QuizSummarySchema, default: () => ({}) },

    // --- Bookmarks / recently viewed ---
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Career' }],
    recentlyViewed: [
      {
        itemType: { type: String, enum: ['career', 'video', 'resource'] },
        itemId: { type: Schema.Types.ObjectId },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Social / professional links ---
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    // --- Account & security ---
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

/* Profile-completeness helper used by the profile routes/UI */
schema.methods.getProfileCompleteness = function () {
  const checks = [
    Boolean(this.name),
    Boolean(this.education?.degreeProgram),
    (this.skills?.technical?.length || 0) > 0 || (this.skills?.soft?.length || 0) > 0,
    (this.interests?.areas?.length || 0) > 0,
    (this.experience?.length || 0) > 0,
    Boolean(this.careerGoals?.targetJobRole),
    Boolean(this.resume),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

export default mongoose.model('User', schema);