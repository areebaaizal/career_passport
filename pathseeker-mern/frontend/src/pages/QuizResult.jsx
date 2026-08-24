import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function QuizResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quiz/result/${id}`)
      .then(r => setResult(r.data))
      .catch(e => setError(e.response?.data?.message || 'Result not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="quiz-page"><div className="card"><p>Loading your result...</p></div></main>;
  }

  if (error || !result) {
    return (
      <main className="quiz-page">
        <div className="card">
          <h1>Result not found</h1>
          <p className="muted">{error}</p>
          <Link className="btn" to="/quiz">Take the quiz</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="quiz-page">
      <section className="result-card">
        <span className="eyebrow">YOUR CAREER MATCH</span>

        <div className="score-ring">
          <strong>{result.percentage}%</strong>
          <span>match</span>
        </div>

        <h1>Your strengths point toward these paths.</h1>
        <p className="muted">
          You scored {result.score} out of {result.total}. Use these recommendations as a
          starting point, then explore the Career Bank.
        </p>

        <div className="recommendations">
          {(result.recommendedCareers || []).length === 0 && (
            <p className="muted">No specific match found — explore the Career Bank to discover more paths.</p>
          )}
          {(result.recommendedCareers || []).map((x, n) => (
            <div className="recommendation" key={x}>
              <span>0{n + 1}</span>
              <b>{x}</b>
              <em>Recommended</em>
            </div>
          ))}
        </div>

        <div>
          <Link className="btn" to="/careers">Explore Careers →</Link>
          <Link className="btn secondary" to="/quiz">Retake quiz</Link>
        </div>
      </section>
    </main>
  );
}