import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function VideoDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [rateMsg, setRateMsg] = useState('');

  const load = () => {
    api.get(`/multimedia/${id}`)
      .then(r => setItem(r.data))
      .catch(() => setError('Video or podcast not found.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const submitRating = async (stars) => {
    setRateMsg('');
    try {
      await api.post(`/multimedia/${id}/rating`, { rating: stars });
      setRateMsg('Thanks for rating!');
      load(); // refresh to show the new average
    } catch (e) {
      setRateMsg(e.response?.data?.message || 'Please login to rate this content.');
    }
  };

  if (loading) return <main className="content-page"><p>Loading...</p></main>;

  if (error || !item) {
    return (
      <main className="content-page">
        <div className="empty wide">{error}</div>
        <Link className="btn" to="/multimedia">Back to Multimedia</Link>
      </main>
    );
  }

  return (
    <main className="content-page">
      <Link className="text-link" to="/multimedia">← Back to Multimedia</Link>

      <div className="detail-hero">
        <span className="tag">{item.category || item.type}</span>
        <h1>{item.title}</h1>
        <p>{item.description}</p>

        {item.type === 'video' ? (
          <div className="video-embed" style={{ aspectRatio: '16/9', maxWidth: 720 }}>
            <iframe
              src={item.url}
              title={item.title}
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 0, borderRadius: 12 }}
            />
          </div>
        ) : (
          <audio controls src={item.url} style={{ width: '100%', maxWidth: 720 }} />
        )}

        <div className="career-meta">
          <span>Average rating <b>⭐ {item.ratingAvg?.toFixed(1) || '0.0'}</b></span>
          <span>{item.ratingCount || 0} ratings</span>
        </div>

        <div className="rating-input">
          <span>Rate this: </span>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} className="star-btn" onClick={() => submitRating(n)}>⭐</button>
          ))}
          {rateMsg && <span className="muted small"> {rateMsg}</span>}
        </div>

        {item.transcript && (
          <div>
            <button className="btn secondary" onClick={() => setShowTranscript(!showTranscript)}>
              {showTranscript ? 'Hide transcript' : 'Show transcript'}
            </button>
            {showTranscript && <p className="muted" style={{ marginTop: 12 }}>{item.transcript}</p>}
          </div>
        )}
      </div>
    </main>
  );
}