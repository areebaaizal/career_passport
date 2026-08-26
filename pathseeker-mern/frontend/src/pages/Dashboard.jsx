import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [stats, setStats] = useState({
    bookmarks: 0,
    attempts: 0,
  });

  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile percentage
  const [profilePercent, setProfilePercent] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [b, q, c, profile] = await Promise.all([
          api.get('/bookmarks'),
          api.get('/quiz/history'),
          api.get('/careers'),

          // Same profile API used by Profile page
          api.get('/auth/profile'),
        ]);

        if (alive) {
          // -----------------------------
          // Dashboard stats
          // -----------------------------
          setStats({
            bookmarks: b.data?.length || 0,
            attempts: q.data?.length || 0,
          });

          // -----------------------------
          // Trending careers
          // -----------------------------
          setCareers(
            (c.data || []).slice(0, 4)
          );

          // -----------------------------
          // PROFILE COMPLETENESS
          // IMPORTANT:
          // Use backend's completeness
          // instead of calculating it again
          // -----------------------------
          setProfilePercent(
            Number(profile.data?.completeness ?? 0)
          );
        }
      } catch (e) {
        console.error(
          'Dashboard loading error:',
          e
        );

        if (alive) {
          setProfilePercent(0);
        }
      } finally {
        if (alive) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ------------------------------------
  // User information
  // ------------------------------------

  const firstName =
    user?.name?.split(' ')[0] || 'there';

  const initials = (user?.name || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ------------------------------------
  // Profile completion
  // ------------------------------------

  const isIncomplete =
    profilePercent < 100;

  return (
    <main className="li-dash">

      <div className="li-grid">

        {/* =====================================================
            LEFT RAIL — PROFILE SUMMARY
        ===================================================== */}

        <aside className="li-rail">

          <div className="li-profile-card">

            <div className="li-cover" />

            <div className="li-avatar">
              {initials}
            </div>

            <h2>
              {user?.name || 'Guest Explorer'}
            </h2>

            <p className="li-role">
              {user?.role || 'Career Passport holder'}
            </p>

            {/* PROFILE PROGRESS */}

            <div className="li-progress">

              <div className="li-progress-track">

                <div
                  className="li-progress-fill"
                  style={{
                    width: `${profilePercent}%`,
                  }}
                />

              </div>

              <span>
                {profileLoading
                  ? 'Loading profile…'
                  : `${profilePercent}% profile complete`}
              </span>

            </div>

            <Link
              to="/profile"
              className="li-rail-link"
            >
              Complete your profile →
            </Link>

          </div>

          {/* QUICK LINKS */}

          <nav className="li-quicklinks">

            <Link to="/careers">
              <span>⌕</span>
              Career Bank
            </Link>

            <Link to="/quiz">
              <span>✦</span>
              Interest Quiz
            </Link>

            <Link to="/resources">
              <span>▣</span>
              Resource Library
            </Link>

            <Link to="/bookmarks">
              <span>☆</span>
              Saved items
            </Link>

          </nav>

        </aside>


        {/* =====================================================
            CENTER — MAIN FEED
        ===================================================== */}

        <section className="li-feed">

          {/* PROFILE INCOMPLETE WARNING */}

          {isIncomplete && !profileLoading && (
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border:
                  '1px solid rgba(245,158,11,0.35)',
                background:
                  'rgba(245,158,11,0.08)',
              }}
            >

              <span
                style={{
                  fontSize: 22,
                }}
              >
                ⚠️
              </span>

              <div
                style={{
                  flex: 1,
                }}
              >

                <strong>
                  Your profile is incomplete (
                  {profilePercent}%)
                </strong>

                <p
                  className="muted"
                  style={{
                    margin: '4px 0 0',
                  }}
                >
                  Complete your profile to unlock
                  better career recommendations.
                </p>

              </div>

              <Link
                className="btn"
                to="/profile"
              >
                Complete now →
              </Link>

            </div>
          )}


          {/* GREETING CARD */}

          <div className="li-greeting card">

            <span className="eyebrow">
              CAREER PASSPORT
            </span>

            <h1>
              Good morning, {firstName} 👋
            </h1>

            <p className="muted">
              Explore your next opportunity
              and keep building your career path.
            </p>

            <Link
              className="btn"
              to="/quiz"
            >
              Take Career Quiz →
            </Link>

          </div>


          {/* QUICK ACTION CARDS */}

          <div className="quick-grid li-quick-grid">

            <Link
              to="/careers"
              className="feature-card"
            >

              <span className="icon">
                ⌕
              </span>

              <div>

                <h3>
                  Explore Career Bank
                </h3>

                <p>
                  Search roles, skills, salary
                  and job demand.
                </p>

              </div>

              <b>
                →
              </b>

            </Link>


            <Link
              to="/quiz"
              className="feature-card"
            >

              <span className="icon">
                ✦
              </span>

              <div>

                <h3>
                  Find Your Match
                </h3>

                <p>
                  Take the interest quiz and
                  discover suitable paths.
                </p>

              </div>

              <b>
                →
              </b>

            </Link>


            <Link
              to="/resources"
              className="feature-card"
            >

              <span className="icon">
                ▣
              </span>

              <div>

                <h3>
                  Learn &amp; Prepare
                </h3>

                <p>
                  Browse career guides and
                  learning resources.
                </p>

              </div>

              <b>
                →
              </b>

            </Link>

          </div>


          {/* TRENDING CAREERS HEADER */}

          <div className="section-head">

            <div>

              <span className="eyebrow">
                TRENDING
              </span>

              <h2>
                Careers to explore
              </h2>

            </div>

            <Link to="/careers">
              View all →
            </Link>

          </div>


          {/* CAREER LIST */}

          <div className="li-career-feed">

            {careers.map((c) => (

              <Link
                className="career-mini li-career-post"
                to={`/careers/${c._id}`}
                key={c._id}
              >

                <span>
                  {(c.title || 'C').slice(0, 1)}
                </span>

                <div>

                  <h3>
                    {c.title}
                  </h3>

                  <p>
                    {c.domain || 'Career'} ·{' '}
                    {c.demand ||
                      'Growing demand'}
                  </p>

                </div>

                <b>
                  →
                </b>

              </Link>

            ))}


            {!careers.length && !loading && (
              <div className="empty">
                No careers have been added yet.
                An admin can add them from the
                Admin panel.
              </div>
            )}


            {loading && (
              <div className="empty">
                Loading trending careers…
              </div>
            )}

          </div>

        </section>


        {/* =====================================================
            RIGHT RAIL — PASSPORT STAMPS / STATS
        ===================================================== */}

        <aside className="li-rail">

          {/* PASSPORT STAMPS */}

          <div className="card li-stamps-card">

            <h3>
              Your passport stamps
            </h3>

            <p className="muted">
              Every action stamps your progress.
            </p>

            <div className="li-stamps-grid">

              {/* QUIZ ATTEMPTS */}

              <div className="li-stamp">

                <div className="li-stamp-circle">
                  {loading
                    ? '—'
                    : stats.attempts}
                </div>

                <span>
                  Quiz attempts
                </span>

              </div>


              {/* SAVED ITEMS */}

              <div className="li-stamp">

                <div className="li-stamp-circle">
                  {loading
                    ? '—'
                    : stats.bookmarks}
                </div>

                <span>
                  Saved items
                </span>

              </div>


              {/* RESUME */}

              <div
                className={`li-stamp ${
                  user?.resume
                    ? ''
                    : 'li-stamp-locked'
                }`}
              >

                <div className="li-stamp-circle">

                  {user?.resume
                    ? '✓'
                    : '🔒'}

                </div>

                <span>
                  Resume added
                </span>

              </div>

            </div>

          </div>


          {/* TIP CARD */}

          <div className="card li-tip-card">

            <h3>
              Tip
            </h3>

            <p className="muted">
              Complete your profile to unlock
              personalized "Top Picks for You"
              recommendations.
            </p>

          </div>

        </aside>

      </div>

    </main>
  );
}