import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function StoryDetails() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stories/${id}`)
      .then(r => setStory(r.data))
      .catch(e => setError(e.response?.data?.message || 'Story not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="content-page"><p>Loading story...</p></main>;

  if (error || !story) {
    return (
      <main className="content-page">
        <div className="empty wide">{error}</div>
        <Link className="btn" to="/success-stories">Back to Success Stories</Link>
      </main>
    );
  }

  return (
    <main className="content-page">
      <Link className="text-link" to="/success-stories">← Back to Success Stories</Link>

      <div className="detail-hero">
        <span className="tag">{story.domain || 'Career journey'}</span>
        <h1>{story.title}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{story.story}</p>
        <strong>— {story.name || 'PathSeeker member'}</strong>
      </div>
    </main>
  );
}
