import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Multimedia() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = params.get('search') || '';
  const type = params.get('type') || 'All';
  const category = params.get('category') || 'All';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (search) q.set('search', search);
        if (type !== 'All') q.set('type', type.toLowerCase());
        if (category !== 'All') q.set('category', category);

        const { data } = await api.get(`/multimedia?${q}`);
        if (active) setItems(data || []);
      } catch (e) {
        if (active) setError('Could not load videos and podcasts.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, [search, type, category]);

  const categories = useMemo(
    () => ['All', ...new Set(items.map(x => x.category).filter(Boolean))],
    [items]
  );

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'All' || !value) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  return (
    <main className="content-page">
      <div className="page-hero">
        <div>
          <span className="eyebrow">MULTIMEDIA CENTER</span>
          <h1>Watch and listen to real career journeys.</h1>
          <p>Videos and podcasts from professionals to help you understand careers beyond the description.</p>
        </div>
        <Link className="btn" to="/success-stories">Read success stories →</Link>
      </div>

      <div className="searchbar">
        <span>⌕</span>
        <input
          value={search}
          onChange={e => update('search', e.target.value)}
          placeholder="Search videos or podcasts..."
        />
        <button onClick={() => update('search', '')}>Clear</button>
      </div>

      <div className="filter-row">
        <div className="filter-label">Type</div>
        {['All', 'Video', 'Podcast'].map(t => (
          <button
            key={t}
            className={type === t ? 'filter active' : 'filter'}
            onClick={() => update('type', t)}
          >
            {t}
          </button>
        ))}

        <select value={category} onChange={e => update('category', e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="resource-grid">
        {loading && [1, 2, 3, 4].map(x => <div className="skeleton resource-skeleton" key={x} />)}
        {!loading && items.map(x => (
          <article className="resource-card" key={x._id}>
            <div className="resource-cover">
              {x.type === 'podcast' ? '🎙' : '▶'}
              <span>↗</span>
            </div>
            <div className="resource-body">
              <span className="tag">{x.category || x.type}</span>
              <h2>{x.title}</h2>
              <p>{x.description || 'Watch or listen to learn more about this career path.'}</p>
              <span className="muted small">
                ⭐ {x.ratingAvg?.toFixed(1) || '0.0'} ({x.ratingCount || 0} ratings)
              </span>
              <Link className="card-link" to={`/multimedia/${x._id}`}>
                {x.type === 'podcast' ? 'Listen now' : 'Watch now'} <b>→</b>
              </Link>
            </div>
          </article>
        ))}
        {!loading && !items.length && (
          <div className="empty wide">No videos or podcasts found. Try a different search or filter.</div>
        )}
      </div>
    </main>
  );
}