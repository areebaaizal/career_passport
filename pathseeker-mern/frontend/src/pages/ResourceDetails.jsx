import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function ResourceDetails() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calling GET /api/resources/:id also increments the download count on the backend
    api.get(`/resources/${id}`)
      .then(r => setResource(r.data))
      .catch(() => setError('Resource not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="content-page"><p>Loading resource...</p></main>;
  }

  if (error || !resource) {
    return (
      <main className="content-page">
        <div className="empty wide">{error}</div>
        <Link className="btn" to="/resources">Back to Resources</Link>
      </main>
    );
  }

  return (
    <main className="content-page">
      <Link className="text-link" to="/resources">← Back to Resources</Link>

      <div className="detail-hero">
        <span className="tag">{resource.category || resource.type}</span>
        <h1>{resource.title}</h1>
        <p>{resource.description}</p>

        <div className="career-meta">
          <span>Type <b>{resource.type}</b></span>
          <span>Downloads <b>{resource.downloadCount}</b></span>
        </div>

        <div className="skill-list">
          {(resource.tags || []).map(t => <span key={t}>{t}</span>)}
        </div>

        <a className="btn" href={resource.fileUrl} target="_blank" rel="noreferrer">
          Download Resource ⬇
        </a>
      </div>
    </main>
  );
}