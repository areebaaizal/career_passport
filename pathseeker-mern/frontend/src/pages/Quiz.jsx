import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Quiz() {
  const nav = useNavigate();
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/quiz/questions')
      .then(r => setQs(r.data || []))
      .catch(() => setError('Quiz questions could not be loaded. Add questions from the admin side.'))
      .finally(() => setLoading(false));
  }, []);

  const choose = n => {
    const a = [...answers];
    a[i] = n;
    setAnswers(a);
  };

  const next = async () => {
    if (answers[i] === undefined) return;
    if (i < qs.length - 1) return setI(i + 1);

    // Last question answered — submit the quiz and go to the result page
    setSubmitting(true);
    try {
      const { data } = await api.post('/quiz/submit', { answers });
      nav(`/quiz/result/${data.attemptId}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Please login to submit your quiz.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="quiz-page"><div className="card"><p>Loading your career quiz...</p></div></main>;
  }

  if (!qs.length) {
    return (
      <main className="quiz-page">
        <div className="card">
          <span className="eyebrow">INTEREST QUIZ</span>
          <h1>Quiz is being prepared.</h1>
          <p className="muted">{error || 'No questions are available yet.'}</p>
          <Link className="btn" to="/dashboard">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  const q = qs[i];
  return (
    <main className="quiz-page">
      <div className="quiz-shell">
        <div className="quiz-progress">
          <div>
            <span className="eyebrow">CAREER DISCOVERY</span>
            <strong>Question {i + 1} <small>of {qs.length}</small></strong>
          </div>
          <span>{Math.round(((i + 1) / qs.length) * 100)}%</span>
        </div>

        <div className="progress"><i style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>

        <section className="quiz-card">
          <span className="question-no">0{i + 1}</span>
          <h1>{q.question}</h1>
          <p>Choose the option that feels most like you.</p>

          <div className="options">
            {(q.options || []).map((o, n) => (
              <button
                key={n}
                className={answers[i] === n ? 'option selected' : 'option'}
                onClick={() => choose(n)}
              >
                <span>{String.fromCharCode(65 + n)}</span>
                {o}
                <b>{answers[i] === n ? '✓' : ''}</b>
              </button>
            ))}
          </div>

          {error && <div className="alert error">{error}</div>}

          <div className="quiz-actions">
            {i > 0
              ? <button className="btn secondary" onClick={() => setI(i - 1)}>← Back</button>
              : <Link className="text-link" to="/dashboard">Exit quiz</Link>}
            <button className="btn" disabled={answers[i] === undefined || submitting} onClick={next}>
              {submitting ? 'Calculating...' : i === qs.length - 1 ? 'See my results' : 'Next question →'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}