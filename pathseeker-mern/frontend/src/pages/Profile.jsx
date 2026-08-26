import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SkillBar from './Skillbar';

/* ------------------------------------------------------------------ */
/* Small shared helpers / subcomponents                               */
/* ------------------------------------------------------------------ */

const fmtBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtMonthYear = (d) => {
  if (!d) return 'Present';

  const date = new Date(d);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
};

// Type a value, press Enter/"," to add it as a chip.
function TagInput({
  label,
  placeholder,
  values,
  onChange,
}) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const v = draft.trim();

    if (!v) return;

    if (
      !values.some(
        (t) => t.toLowerCase() === v.toLowerCase()
      )
    ) {
      onChange([...values, v]);
    }

    setDraft('');
  };

  const removeTag = (tag) => {
    onChange(values.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (
      e.key === 'Backspace' &&
      !draft &&
      values.length
    ) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <label>
      {label}

      <div className="li-tag-input">
        {values.map((tag) => (
          <span className="li-tag" key={tag}>
            {tag}

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={
            values.length
              ? 'Add another…'
              : placeholder
          }
        />
      </div>
    </label>
  );
}

// Chip-picker for a fixed set of options
function ChipToggle({
  options,
  selected,
  onChange,
  multi = true,
}) {
  const toggle = (opt) => {
    if (multi) {
      onChange(
        selected.includes(opt)
          ? selected.filter((s) => s !== opt)
          : [...selected, opt]
      );
    } else {
      onChange(
        selected[0] === opt ? [] : [opt]
      );
    }
  };

  return (
    <div className="li-chip-toggle">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`li-chip ${
            selected.includes(opt)
              ? 'li-chip-active'
              : ''
          }`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  right,
}) {
  return (
    <div className="li-section-card">
      <div className="li-section-head">
        <div className="li-section-head-left">
          <span className="li-section-icon">
            {icon}
          </span>

          <h3>{title}</h3>
        </div>

        {right}
      </div>

      {subtitle && (
        <p className="muted li-section-subtitle">
          {subtitle}
        </p>
      )}

      <div className="li-section-body">
        {children}
      </div>
    </div>
  );
}

const AREAS_OF_INTEREST = [
  'Web Development',
  'AI/ML',
  'Cyber Security',
  'UI/UX',
  'Data Science',
  'Business',
  'Healthcare',
  'Finance',
];

const USER_TYPES = [
  'student',
  'graduate',
  'professional',
];

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'internship',
  'contract',
  'freelance',
];

const CAREER_LEVELS = [
  'entry',
  'mid',
  'senior',
];

const emptyExperience = {
  companyName: '',
  jobTitle: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  responsibilities: '',
  skillsUsed: [],
};

/* ------------------------------------------------------------------ */
/* Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Profile() {
  const cachedUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const [completeness, setCompleteness] = useState(0);

  const [u, setU] = useState(cachedUser);

  // Ref for bottom success/error message
  const bottomMsgRef = useRef(null);

  /* ---------------- section state ---------------- */

  const [basic, setBasic] = useState({
    name: '',
    phone: '',
    role: 'student',
    location: '',
    dateOfBirth: '',
  });

  const [education, setEducation] = useState({
    highestQualification: '',
    degreeProgram: '',
    institute: '',
    major: '',
    graduationYear: '',
    currentStatus: '',
  });

  const [certifications, setCertifications] =
    useState([]);

  const [skills, setSkills] = useState({
    technical: [],
    soft: [],
    programmingLanguages: [],
    toolsAndTech: [],
  });

  const [interests, setInterests] = useState({
    areas: [],
    preferredDomains: [],
    preferredJobRoles: [],
    workPreference: '',
    preferredIndustry: [],
  });

  const [careerGoals, setCareerGoals] = useState({
    shortTerm: '',
    longTerm: '',
    targetJobRole: '',
    targetIndustry: '',
    desiredSalaryRange: {
      min: '',
      max: '',
      currency: 'PKR',
    },
    preferredCountryRegion: '',
    careerLevel: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    portfolio: '',
    other: [],
  });

  // Work experience
  const [experience, setExperience] =
    useState([]);

  const [editingExp, setEditingExp] =
    useState(null);

  // Resume
  const [resumeFile, setResumeFile] =
    useState(null);

  const [resumeVisibility, setResumeVisibility] =
    useState('private');

  const [removingResume, setRemovingResume] =
    useState(false);

  // Read-only summaries
  const [quizSummary, setQuizSummary] =
    useState(null);

  const [bookmarks, setBookmarks] =
    useState([]);

  const [recentlyViewed, setRecentlyViewed] =
    useState([]);

  const [newSkillDraft, setNewSkillDraft] =
    useState({
      technical: '',
      soft: '',
      programmingLanguages: '',
      toolsAndTech: '',
    });

  /* ---------------------------------------------------------------- */
  /* Message helper                                                   */
  /* ---------------------------------------------------------------- */

  const showMsg = (
    text,
    type = 'success'
  ) => {
    setMsg(text);
    setMsgType(type);

    setTimeout(() => {
      bottomMsgRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  /* ---------------------------------------------------------------- */
  /* Load profile                                                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } =
          await api.get('/auth/profile');

        if (!alive) return;

        const user = data.user;

        setU(user);

        localStorage.setItem(
          'user',
          JSON.stringify(user)
        );

        setCompleteness(
          data.completeness ?? 0
        );

        setBasic({
          name: user.name || '',
          phone: user.phone || '',
          role: user.role || 'student',
          location: user.location || '',
          dateOfBirth: user.dateOfBirth
            ? user.dateOfBirth.slice(0, 10)
            : '',
        });

        setEducation({
          highestQualification:
            user.education
              ?.highestQualification || '',

          degreeProgram:
            user.education?.degreeProgram || '',

          institute:
            user.education?.institute || '',

          major:
            user.education?.major || '',

          graduationYear:
            user.education?.graduationYear || '',

          currentStatus:
            user.education?.currentStatus || '',
        });

        setCertifications(
          user.education?.certifications || []
        );

        setSkills({
          technical:
            user.skills?.technical || [],

          soft:
            user.skills?.soft || [],

          programmingLanguages:
            user.skills?.programmingLanguages || [],

          toolsAndTech:
            user.skills?.toolsAndTech || [],
        });

        setInterests({
          areas:
            user.interests?.areas || [],

          preferredDomains:
            user.interests?.preferredDomains || [],

          preferredJobRoles:
            user.interests?.preferredJobRoles || [],

          workPreference:
            user.interests?.workPreference || '',

          preferredIndustry:
            user.interests?.preferredIndustry || [],
        });

        setCareerGoals({
          shortTerm:
            user.careerGoals?.shortTerm || '',

          longTerm:
            user.careerGoals?.longTerm || '',

          targetJobRole:
            user.careerGoals?.targetJobRole || '',

          targetIndustry:
            user.careerGoals?.targetIndustry || '',

          desiredSalaryRange: {
            min:
              user.careerGoals
                ?.desiredSalaryRange?.min ?? '',

            max:
              user.careerGoals
                ?.desiredSalaryRange?.max ?? '',

            currency:
              user.careerGoals
                ?.desiredSalaryRange?.currency ||
              'PKR',
          },

          preferredCountryRegion:
            user.careerGoals
              ?.preferredCountryRegion || '',

          careerLevel:
            user.careerGoals?.careerLevel || '',
        });

        setSocialLinks({
          linkedin:
            user.socialLinks?.linkedin || '',

          github:
            user.socialLinks?.github || '',

          portfolio:
            user.socialLinks?.portfolio || '',

          other:
            user.socialLinks?.other || [],
        });

        setExperience(
          user.experience || []
        );

        setResumeVisibility(
          user.resume?.visibility || 'private'
        );

        setQuizSummary(
          user.quizSummary || null
        );

        setBookmarks(
          user.bookmarks || []
        );

        setRecentlyViewed(
          user.recentlyViewed || []
        );
      } catch (e) {
        console.error(
          'Profile loading error:',
          e
        );

        setMsg(
          'Could not load profile — some sections may be unavailable yet.'
        );

        setMsgType('error');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Save profile                                                     */
  /* ---------------------------------------------------------------- */

  const saveProfile = async (e) => {
    e?.preventDefault();

    if (saving) return;

    setSaving(true);
    setMsg('');

    try {
      let payload;

      /*
       * If resume is selected, use FormData.
       */
      if (resumeFile) {
        payload = new FormData();

        payload.append(
          'name',
          basic.name
        );

        payload.append(
          'phone',
          basic.phone
        );

        payload.append(
          'role',
          basic.role
        );

        payload.append(
          'location',
          basic.location
        );

        payload.append(
          'dateOfBirth',
          basic.dateOfBirth
        );

        payload.append(
          'education',
          JSON.stringify({
            ...education,
            certifications,
          })
        );

        payload.append(
          'skills',
          JSON.stringify(skills)
        );

        payload.append(
          'interests',
          JSON.stringify(interests)
        );

        payload.append(
          'careerGoals',
          JSON.stringify(careerGoals)
        );

        payload.append(
          'socialLinks',
          JSON.stringify(socialLinks)
        );

        payload.append(
          'resumeVisibility',
          resumeVisibility
        );

        payload.append(
          'resume',
          resumeFile
        );
      } else {
        /*
         * Normal JSON request
         */
        payload = {
          ...basic,

          education: {
            ...education,
            certifications,
          },

          skills,

          interests,

          careerGoals,

          socialLinks,

          resumeVisibility,
        };
      }

      const { data } =
        await api.put(
          '/auth/profile',
          payload
        );

      /*
       * Update local UI
       */
      setU(data.user);

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      setCompleteness(
        data.completeness ?? completeness
      );

      setResumeFile(null);

      /*
       * SUCCESS MESSAGE
       */
      showMsg(
        'Profile updated successfully.',
        'success'
      );
    } catch (e) {
      console.error(
        'Profile update error:',
        e
      );

      showMsg(
        e.response?.data?.message ||
          'Profile update failed. Please try again.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Remove resume                                                    */
  /* ---------------------------------------------------------------- */

  const removeResume = async () => {
    if (!u.resume) return;

    setRemovingResume(true);
    setMsg('');

    try {
      const { data } =
        await api.put(
          '/auth/profile',
          {
            removeResume: true,
          }
        );

      setU(data.user);

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      setResumeFile(null);

      showMsg(
        'Resume removed successfully.',
        'success'
      );
    } catch (e) {
      console.error(
        'Remove resume error:',
        e
      );

      showMsg(
        e.response?.data?.message ||
          'Could not remove resume.',
        'error'
      );
    } finally {
      setRemovingResume(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Work experience CRUD                                             */
  /* ---------------------------------------------------------------- */

  const saveExperienceEntry = async () => {
    if (
      !editingExp?.companyName ||
      !editingExp?.jobTitle
    ) {
      showMsg(
        'Company name and job title are required.',
        'error'
      );

      return;
    }

    try {
      if (editingExp._id) {
        const { data } =
          await api.put(
            `/auth/profile/experience/${editingExp._id}`,
            editingExp
          );

        setExperience(
          data.experience
        );

        showMsg(
          'Work experience updated successfully.',
          'success'
        );
      } else {
        const { data } =
          await api.post(
            '/auth/profile/experience',
            editingExp
          );

        setExperience(
          data.experience
        );

        showMsg(
          'Work experience added successfully.',
          'success'
        );
      }

      setEditingExp(null);
    } catch (e) {
      console.error(
        'Experience save error:',
        e
      );

      showMsg(
        e.response?.data?.message ||
          'Could not save work experience.',
        'error'
      );
    }
  };

  const deleteExperienceEntry =
    async (id) => {
      try {
        const { data } =
          await api.delete(
            `/auth/profile/experience/${id}`
          );

        setExperience(
          data.experience
        );

        showMsg(
          'Work experience removed successfully.',
          'success'
        );
      } catch (e) {
        console.error(
          'Delete experience error:',
          e
        );

        showMsg(
          e.response?.data?.message ||
            'Could not remove entry.',
          'error'
        );
      }
    };

  /* ---------------------------------------------------------------- */
  /* Skill helpers                                                    */
  /* ---------------------------------------------------------------- */

  const addSkill = (category) => {
    const name =
      newSkillDraft[category].trim();

    if (!name) return;

    setSkills((prev) => ({
      ...prev,

      [category]: [
        ...prev[category],
        {
          name,
          level: 50,
        },
      ],
    }));

    setNewSkillDraft((d) => ({
      ...d,
      [category]: '',
    }));
  };

  const updateSkillLevel = (
    category,
    idx,
    level
  ) => {
    setSkills((prev) => {
      const next = [
        ...prev[category],
      ];

      next[idx] = {
        ...next[idx],
        level,
      };

      return {
        ...prev,
        [category]: next,
      };
    });
  };

  const removeSkill = (
    category,
    idx
  ) => {
    setSkills((prev) => ({
      ...prev,

      [category]: prev[
        category
      ].filter(
        (_, i) => i !== idx
      ),
    }));
  };

  /* ---------------------------------------------------------------- */
  /* Initials                                                         */
  /* ---------------------------------------------------------------- */

  const initials = (
    basic.name ||
    u.name ||
    'U'
  )
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  /* ---------------------------------------------------------------- */
  /* Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <main className="li-dash">
        <div className="empty">
          Loading profile…
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /* UI                                                               */
  /* ---------------------------------------------------------------- */

  return (
    <main className="li-dash">

      <div className="li-profile-grid">

        {/* ========================================================== */}
        {/* LEFT RAIL                                                   */}
        {/* ========================================================== */}

        <div className="li-rail">

          {/* Profile Header */}
          <div className="li-profile-header card">

            <div className="li-cover li-cover-lg" />

            <div className="li-avatar li-avatar-lg">
              {u.profilePicture ? (
                <img
                  src={u.profilePicture}
                  alt={basic.name}
                />
              ) : (
                initials
              )}
            </div>

            <h1>
              {basic.name ||
                'Your name'}
            </h1>

            <p className="muted">
              {u.email ||
                'No email on file'}
            </p>

            <p className="li-role">
              {basic.role}
            </p>

            <div className="li-progress li-profile-progress">

              <div className="li-progress-track">

                <div
                  className="li-progress-fill"
                  style={{
                    width: `${completeness}%`,
                  }}
                />

              </div>

              <span>
                {completeness}%
                profile complete
              </span>

            </div>

          </div>

          {/* ======================================================== */}
          {/* Quiz                                                      */}
          {/* ======================================================== */}

          <div className="card li-stamps-card">

            <h3>
              Quiz &amp; assessment
            </h3>

            {quizSummary?.attemptsCount ? (
              <>
                <p className="muted">
                  Your Interest Profile:{' '}
                  {quizSummary.interestCategory ||
                    '—'}
                </p>

                <p>
                  <strong>
                    Top match:
                  </strong>{' '}
                  {quizSummary
                    .recommendedDomains?.[0] ||
                    '—'}

                  <br />

                  <strong>
                    Quiz score:
                  </strong>{' '}
                  {quizSummary.latestScore ??
                    '—'}
                  %
                </p>

                <p
                  className="muted"
                  style={{
                    fontSize: 12,
                  }}
                >
                  Last attempt:{' '}
                  {fmtMonthYear(
                    quizSummary.lastAttemptDate
                  )}{' '}
                  ·{' '}
                  {quizSummary.attemptsCount}{' '}
                  attempt(s)
                </p>
              </>
            ) : (
              <p className="muted">
                You haven't taken the
                interest quiz yet.
              </p>
            )}

            <a
              className="btn"
              href="/quiz"
            >
              {quizSummary?.attemptsCount
                ? 'Retake Quiz →'
                : 'Take Quiz →'}
            </a>

          </div>

          {/* ======================================================== */}
          {/* Bookmarks                                                  */}
          {/* ======================================================== */}

          <div className="card li-stamps-card">

            <h3>
              Bookmarked careers
            </h3>

            {bookmarks.length ? (
              <ul className="li-bookmark-list">

                {bookmarks
                  .slice(0, 5)
                  .map((b) => (
                    <li key={b._id}>
                      ❤️{' '}
                      {b.title ||
                        b.name}
                    </li>
                  ))}

              </ul>
            ) : (
              <p className="muted">
                Nothing bookmarked yet.
              </p>
            )}

          </div>

          {/* ======================================================== */}
          {/* Recently Viewed                                           */}
          {/* ======================================================== */}

          <div className="card li-stamps-card">

            <h3>
              Recently viewed
            </h3>

            {recentlyViewed.length ? (
              <ul className="li-bookmark-list">

                {recentlyViewed
                  .slice(0, 5)
                  .map((r, i) => (
                    <li key={i}>

                      {r.itemType ===
                      'career'
                        ? '🧭'
                        : r.itemType ===
                          'video'
                        ? '▶️'
                        : '📄'}{' '}

                      {r.itemType}

                    </li>
                  ))}

              </ul>
            ) : (
              <p className="muted">
                Nothing viewed yet.
              </p>
            )}

          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT FORM                                                  */}
        {/* ========================================================== */}

        <div className="card li-profile-form-card">

          <span className="eyebrow">
            ACCOUNT
          </span>

          <h2>
            Edit profile
          </h2>

          <p className="muted">
            Keep your details updated
            for better, more personalized
            career recommendations.
          </p>

          {/* Top message */}
          {msg && (
            <div
              className={`alert ${
                msgType === 'error'
                  ? 'error'
                  : ''
              }`}
            >
              {msgType === 'error'
                ? '❌'
                : '✅'}{' '}
              {msg}
            </div>
          )}

          <form
            onSubmit={saveProfile}
          >

            {/* ====================================================== */}
            {/* 1. BASIC INFORMATION                                   */}
            {/* ====================================================== */}

            <SectionCard
              icon="👤"
              title="Basic information"
            >

              <label>
                Full name

                <input
                  value={basic.name}
                  onChange={(e) =>
                    setBasic({
                      ...basic,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Amal Hisbani"
                />

              </label>

              <label>
                Email

                <input
                  value={u.email || ''}
                  disabled
                />

              </label>

              <label>
                Phone number (optional)

                <input
                  value={basic.phone}
                  onChange={(e) =>
                    setBasic({
                      ...basic,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+92 300 1234567"
                />

              </label>

              <label>
                User type

                <select
                  value={basic.role}
                  onChange={(e) =>
                    setBasic({
                      ...basic,
                      role: e.target.value,
                    })
                  }
                >

                  {USER_TYPES.map(
                    (t) => (
                      <option
                        key={t}
                        value={t}
                      >
                        {t[0].toUpperCase() +
                          t.slice(1)}
                      </option>
                    )
                  )}

                </select>

              </label>

              <label>
                Location / Country

                <input
                  value={basic.location}
                  onChange={(e) =>
                    setBasic({
                      ...basic,
                      location:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Karachi, Pakistan"
                />

              </label>

              <label>
                Date of birth (optional)

                <input
                  type="date"
                  value={
                    basic.dateOfBirth
                  }
                  onChange={(e) =>
                    setBasic({
                      ...basic,
                      dateOfBirth:
                        e.target.value,
                    })
                  }
                />

              </label>

            </SectionCard>

            {/* ====================================================== */}
            {/* 2. EDUCATION                                            */}
            {/* ====================================================== */}

            <SectionCard
              icon="🎓"
              title="Education"
            >

              <label>
                Highest qualification

                <input
                  value={
                    education.highestQualification
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      highestQualification:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Bachelor's"
                />

              </label>

              <label>
                Degree / Program

                <input
                  value={
                    education.degreeProgram
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      degreeProgram:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. BS Computer Science"
                />

              </label>

              <label>
                Institute / University

                <input
                  value={
                    education.institute
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      institute:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. ABC University"
                />

              </label>

              <label>
                Major / Field

                <input
                  value={
                    education.major
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      major:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Graduation year

                <input
                  type="number"
                  value={
                    education.graduationYear
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      graduationYear:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. 2026"
                />

              </label>

              <label>
                Current education status

                <select
                  value={
                    education.currentStatus
                  }
                  onChange={(e) =>
                    setEducation({
                      ...education,
                      currentStatus:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select…
                  </option>

                  <option value="ongoing">
                    Ongoing
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="gap-year">
                    Gap year
                  </option>

                </select>

              </label>

              <TagInput
                label="Certifications"
                placeholder="e.g. AWS Certified Cloud Practitioner"
                values={certifications}
                onChange={
                  setCertifications
                }
              />

            </SectionCard>

            {/* ====================================================== */}
            {/* 3. SKILLS                                               */}
            {/* ====================================================== */}

            <SectionCard
              icon="⭐"
              title="Skills"
              subtitle="Drives your career recommendations — add a level for each skill."
            >

              {[
                'technical',
                'soft',
                'programmingLanguages',
                'toolsAndTech',
              ].map((cat) => (

                <div
                  key={cat}
                  className="li-skill-category"
                >

                  <span className="li-skill-category-label">

                    {{
                      technical:
                        'Technical skills',

                      soft:
                        'Soft skills',

                      programmingLanguages:
                        'Programming languages',

                      toolsAndTech:
                        'Tools & technologies',
                    }[cat]}

                  </span>

                  {skills[cat].map(
                    (s, i) => (
                      <SkillBar
                        key={`${cat}-${s.name}-${i}`}
                        name={s.name}
                        level={s.level}
                        editable
                        onLevelChange={(
                          lvl
                        ) =>
                          updateSkillLevel(
                            cat,
                            i,
                            lvl
                          )
                        }
                        onRemove={() =>
                          removeSkill(
                            cat,
                            i
                          )
                        }
                      />
                    )
                  )}

                  <div className="li-skill-add-row">

                    <input
                      value={
                        newSkillDraft[
                          cat
                        ]
                      }
                      onChange={(e) =>
                        setNewSkillDraft(
                          (d) => ({
                            ...d,
                            [cat]:
                              e.target.value,
                          })
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          'Enter'
                        ) {
                          e.preventDefault();
                          addSkill(cat);
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                    />

                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        addSkill(cat)
                      }
                    >
                      Add
                    </button>

                  </div>

                </div>

              ))}

            </SectionCard>

            {/* ====================================================== */}
            {/* 4. INTERESTS                                            */}
            {/* ====================================================== */}

            <SectionCard
              icon="🧭"
              title="Interests & career preferences"
            >

              <span className="li-skill-category-label">
                Areas of interest
              </span>

              <ChipToggle
                options={
                  AREAS_OF_INTEREST
                }
                selected={
                  interests.areas
                }
                onChange={(v) =>
                  setInterests({
                    ...interests,
                    areas: v,
                  })
                }
              />

              <TagInput
                label="Preferred career domains"
                placeholder="e.g. Fintech"
                values={
                  interests.preferredDomains
                }
                onChange={(v) =>
                  setInterests({
                    ...interests,
                    preferredDomains:
                      v,
                  })
                }
              />

              <TagInput
                label="Preferred job roles"
                placeholder="e.g. Frontend Developer"
                values={
                  interests.preferredJobRoles
                }
                onChange={(v) =>
                  setInterests({
                    ...interests,
                    preferredJobRoles:
                      v,
                  })
                }
              />

              <label>
                Work preference

                <select
                  value={
                    interests.workPreference
                  }
                  onChange={(e) =>
                    setInterests({
                      ...interests,
                      workPreference:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select…
                  </option>

                  <option value="remote">
                    Remote
                  </option>

                  <option value="on-site">
                    On-site
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>

                </select>

              </label>

              <TagInput
                label="Preferred industry"
                placeholder="e.g. Healthcare"
                values={
                  interests.preferredIndustry
                }
                onChange={(v) =>
                  setInterests({
                    ...interests,
                    preferredIndustry:
                      v,
                  })
                }
              />

            </SectionCard>

            {/* ====================================================== */}
            {/* 5. WORK EXPERIENCE                                     */}
            {/* ====================================================== */}

            <SectionCard
              icon="💼"
              title="Work experience"
              subtitle="Particularly useful for graduates and professionals."
              right={
                !editingExp && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      setEditingExp({
                        ...emptyExperience,
                      })
                    }
                  >
                    + Add
                  </button>
                )
              }
            >

              {experience.length === 0 &&
                !editingExp && (
                  <p className="muted">
                    No work experience
                    added yet.
                  </p>
                )}

              {experience.map(
                (exp) => (

                  <div
                    className="li-exp-item"
                    key={exp._id}
                  >

                    <div>

                      <strong>
                        {exp.jobTitle}
                      </strong>{' '}
                      —{' '}
                      {exp.companyName}

                      <p
                        className="muted"
                        style={{
                          margin:
                            '2px 0',
                        }}
                      >
                        {fmtMonthYear(
                          exp.startDate
                        )}{' '}
                        –{' '}
                        {fmtMonthYear(
                          exp.endDate
                        )}{' '}
                        ·{' '}
                        {exp.employmentType}
                      </p>

                      {exp.responsibilities && (
                        <p
                          style={{
                            fontSize: 13,
                          }}
                        >
                          {
                            exp.responsibilities
                          }
                        </p>
                      )}

                      {exp.skillsUsed
                        ?.length >
                        0 && (

                        <div className="skill-list">

                          {exp.skillsUsed.map(
                            (s) => (
                              <span
                                key={s}
                              >
                                {s}
                              </span>
                            )
                          )}

                        </div>
                      )}

                    </div>

                    <div className="li-exp-actions">

                      <button
                        type="button"
                        onClick={() =>
                          setEditingExp(
                            exp
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteExperienceEntry(
                            exp._id
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                )
              )}

              {/* Experience Editor */}

              {editingExp && (

                <div className="li-exp-editor">

                  <label>
                    Company name

                    <input
                      value={
                        editingExp.companyName
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          companyName:
                            e.target.value,
                        })
                      }
                    />

                  </label>

                  <label>
                    Job title

                    <input
                      value={
                        editingExp.jobTitle
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          jobTitle:
                            e.target.value,
                        })
                      }
                    />

                  </label>

                  <label>
                    Employment type

                    <select
                      value={
                        editingExp.employmentType
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          employmentType:
                            e.target.value,
                        })
                      }
                    >

                      <option value="">
                        Select…
                      </option>

                      {EMPLOYMENT_TYPES.map(
                        (t) => (
                          <option
                            key={t}
                            value={t}
                          >
                            {t}
                          </option>
                        )
                      )}

                    </select>

                  </label>

                  <label>
                    Start date

                    <input
                      type="date"
                      value={
                        editingExp.startDate
                          ?.slice?.(
                            0,
                            10
                          ) ||
                        editingExp.startDate ||
                        ''
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          startDate:
                            e.target.value,
                        })
                      }
                    />

                  </label>

                  <label>
                    End date
                    (leave blank if current)

                    <input
                      type="date"
                      value={
                        editingExp.endDate
                          ?.slice?.(
                            0,
                            10
                          ) ||
                        editingExp.endDate ||
                        ''
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          endDate:
                            e.target.value,
                        })
                      }
                    />

                  </label>

                  <label>
                    Responsibilities

                    <textarea
                      rows={3}
                      value={
                        editingExp.responsibilities
                      }
                      onChange={(e) =>
                        setEditingExp({
                          ...editingExp,
                          responsibilities:
                            e.target.value,
                        })
                      }
                    />

                  </label>

                  <TagInput
                    label="Skills used"
                    placeholder="e.g. React"
                    values={
                      editingExp.skillsUsed ||
                      []
                    }
                    onChange={(v) =>
                      setEditingExp({
                        ...editingExp,
                        skillsUsed: v,
                      })
                    }
                  />

                  <div className="li-exp-actions">

                    <button
                      type="button"
                      className="btn"
                      onClick={
                        saveExperienceEntry
                      }
                    >
                      Save entry
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingExp(null)
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              )}

            </SectionCard>

            {/* ====================================================== */}
            {/* 6. CAREER GOALS                                        */}
            {/* ====================================================== */}

            <SectionCard
              icon="🎯"
              title="Career goals"
            >

              <label>
                Short-term goal

                <input
                  value={
                    careerGoals.shortTerm
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      shortTerm:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Long-term goal

                <input
                  value={
                    careerGoals.longTerm
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      longTerm:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Target job role

                <input
                  value={
                    careerGoals.targetJobRole
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      targetJobRole:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Target industry

                <input
                  value={
                    careerGoals.targetIndustry
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      targetIndustry:
                        e.target.value,
                    })
                  }
                />

              </label>

              <div className="li-salary-row">

                <label>
                  Desired salary — min

                  <input
                    type="number"
                    value={
                      careerGoals
                        .desiredSalaryRange
                        .min
                    }
                    onChange={(e) =>
                      setCareerGoals({
                        ...careerGoals,

                        desiredSalaryRange:
                          {
                            ...careerGoals
                              .desiredSalaryRange,

                            min:
                              e.target.value,
                          },
                      })
                    }
                  />

                </label>

                <label>
                  Max

                  <input
                    type="number"
                    value={
                      careerGoals
                        .desiredSalaryRange
                        .max
                    }
                    onChange={(e) =>
                      setCareerGoals({
                        ...careerGoals,

                        desiredSalaryRange:
                          {
                            ...careerGoals
                              .desiredSalaryRange,

                            max:
                              e.target.value,
                          },
                      })
                    }
                  />

                </label>

                <label>
                  Currency

                  <input
                    value={
                      careerGoals
                        .desiredSalaryRange
                        .currency
                    }
                    onChange={(e) =>
                      setCareerGoals({
                        ...careerGoals,

                        desiredSalaryRange:
                          {
                            ...careerGoals
                              .desiredSalaryRange,

                            currency:
                              e.target.value,
                          },
                      })
                    }
                  />

                </label>

              </div>

              <label>
                Preferred country / region

                <input
                  value={
                    careerGoals.preferredCountryRegion
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      preferredCountryRegion:
                        e.target.value,
                    })
                  }
                />

              </label>

              <label>
                Career level

                <select
                  value={
                    careerGoals.careerLevel
                  }
                  onChange={(e) =>
                    setCareerGoals({
                      ...careerGoals,
                      careerLevel:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select…
                  </option>

                  {CAREER_LEVELS.map(
                    (l) => (
                      <option
                        key={l}
                        value={l}
                      >
                        {l[0].toUpperCase() +
                          l.slice(1)}{' '}
                        level
                      </option>
                    )
                  )}

                </select>

              </label>

            </SectionCard>

            {/* ====================================================== */}
            {/* 7. RESUME                                               */}
            {/* ====================================================== */}

            <SectionCard
              icon="📄"
              title="Resume"
            >

              {u.resume ? (

                <div>

                  <div className="li-resume-current">

                    <span
                      style={{
                        fontSize: 20,
                      }}
                    >
                      📎
                    </span>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >

                      <div className="li-resume-name">

                        {resumeFile
                          ? resumeFile.name
                          : u.resume
                              .split('/')
                              .pop()}

                      </div>

                      {resumeFile ? (

                        <div
                          className="muted"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {fmtBytes(
                            resumeFile.size
                          )}{' '}
                          · not saved yet —
                          click Save Profile
                        </div>

                      ) : (

                        <div
                          className="muted"
                          style={{
                            fontSize: 12,
                          }}
                        >

                          <a
                            href={u.resume}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>

                          {' · '}

                          <a
                            href={u.resume}
                            download
                          >
                            Download
                          </a>

                        </div>

                      )}

                    </div>

                    <button
                      type="button"
                      className="li-resume-remove"
                      onClick={
                        removeResume
                      }
                      disabled={
                        removingResume
                      }
                    >
                      {removingResume
                        ? 'Removing…'
                        : 'Delete'}
                    </button>

                  </div>

                  <label
                    className="li-file-label"
                    style={{
                      display:
                        'inline-block',
                      marginBottom: 16,
                    }}
                  >
                    Replace with a
                    different file

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="li-file-input"
                      onChange={(e) =>
                        setResumeFile(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                    />

                  </label>

                  <div>

                    <span
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Who can see this
                      resume?
                    </span>

                    <div className="li-visibility-toggle">

                      {[
                        'private',
                        'public',
                      ].map(
                        (opt) => (

                          <button
                            type="button"
                            key={opt}
                            className={
                              resumeVisibility ===
                              opt
                                ? 'li-visibility-active'
                                : ''
                            }
                            onClick={() =>
                              setResumeVisibility(
                                opt
                              )
                            }
                          >
                            {opt ===
                            'private'
                              ? '🔒 Private'
                              : '🌐 Public'}
                          </button>

                        )
                      )}

                    </div>

                  </div>

                </div>

              ) : (

                <label className="li-file-label">

                  Choose a PDF or
                  Word file

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="li-file-input"
                    onChange={(e) =>
                      setResumeFile(
                        e.target.files?.[0] ||
                          null
                      )
                    }
                  />

                </label>

              )}

            </SectionCard>

            {/* ====================================================== */}
            {/* 8. SOCIAL LINKS                                         */}
            {/* ====================================================== */}

            <SectionCard
              icon="🔗"
              title="Social / professional links"
              subtitle="Optional, but strengthens your profile."
            >

              <label>
                LinkedIn

                <input
                  value={
                    socialLinks.linkedin
                  }
                  onChange={(e) =>
                    setSocialLinks({
                      ...socialLinks,
                      linkedin:
                        e.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/…"
                />

              </label>

              <label>
                GitHub

                <input
                  value={
                    socialLinks.github
                  }
                  onChange={(e) =>
                    setSocialLinks({
                      ...socialLinks,
                      github:
                        e.target.value,
                    })
                  }
                  placeholder="https://github.com/…"
                />

              </label>

              <label>
                Portfolio website

                <input
                  value={
                    socialLinks.portfolio
                  }
                  onChange={(e) =>
                    setSocialLinks({
                      ...socialLinks,
                      portfolio:
                        e.target.value,
                    })
                  }
                  placeholder="https://…"
                />

              </label>

            </SectionCard>

            {/* ====================================================== */}
            {/* SAVE PROFILE                                             */}
            {/* ====================================================== */}

            <button
              type="submit"
              className="btn full"
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : 'Save Profile'}
            </button>

            {/* Bottom success/error message */}

            {msg && (
              <div
                ref={bottomMsgRef}
                className={`alert ${
                  msgType === 'error'
                    ? 'error'
                    : ''
                }`}
                style={{
                  marginTop: 12,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {msgType === 'error'
                  ? '❌'
                  : '✅'}{' '}
                {msg}
              </div>
            )}

          </form>

          {/* ======================================================== */}
          {/* ACCOUNT & SECURITY                                       */}
          {/* ======================================================== */}

          <SectionCard
            icon="🔐"
            title="Account & security"
          >

            <p
              className="muted"
              style={{
                margin: '0 0 10px',
              }}
            >
              Email verification:{' '}
              {u.emailVerified
                ? '✅ Verified'
                : '⚠️ Not verified'}
            </p>

            <div className="li-account-actions">

              <Link
                className="btn"
                to="/change-password"
              >
                Change password
              </Link>

              <a
                className="btn"
                href="/logout"
              >
                Logout
              </a>

              <Link
                className="li-danger-link"
                to="/delete-account"
              >
                Delete account
              </Link>

            </div>

          </SectionCard>

        </div>

      </div>

    </main>
  );
}