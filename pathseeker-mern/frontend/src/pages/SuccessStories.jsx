import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function SuccessStories() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', domain: '', story: '' });
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const domain = params.get('domain') || 'All';

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (domain !== 'All') q.set('domain', domain);

    api.get(`/stories?${q}`)
      .then(r => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [domain]);

  const domains = useMemo(
    () => ['All', ...new Set(items.map(x => x.domain).filter(Boolean))],
    [items]
  );

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'All' || !value) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const submitStory = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    try {
      await api.post('/stories', form);
      setSubmitError(false);
      setSubmitMsg('Thank you! Your story has been submitted and is waiting for admin approval.');
      setForm({ name: '', title: '', domain: '', story: '' });
    } catch (err) {
      setSubmitError(true);
      setSubmitMsg(err.response?.data?.message || 'Please login to submit your story.');
    }
  };

  return (
    <main className="content-page">
      <div className="page-hero">
        <div>
          <span className="eyebrow">SUCCESS STORIES</span>
          <h1>Real paths. Real progress.</h1>
          <p>Learn how others navigated education, skills and career changes.</p>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close form' : 'Share your story →'}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={submitStory} style={{ marginBottom: 24, display: 'grid', gap: 12 }}>
          <input
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Story title (e.g. From Marketing to Web Development)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Domain (e.g. Technology, Design, Data)"
            value={form.domain}
            onChange={e => setForm({ ...form, domain: e.target.value })}
          />
          <textarea
            placeholder="Tell your story..."
            rows={5}
            value={form.story}
            onChange={e => setForm({ ...form, story: e.target.value })}
            required
          />
          <button className="btn" type="submit">Submit for review</button>
          {submitMsg && (
            <p className={submitError ? 'alert error' : 'muted small'}>{submitMsg}</p>
          )}
        </form>
      )}

      <div className="filter-row">
        <div className="filter-label">Domain</div>
        {domains.map(d => (
          <button
            key={d}
            className={domain === d ? 'filter active' : 'filter'}
            onClick={() => update('domain', d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="story-grid">
        {loading && [1, 2, 3].map(x => <div className="skeleton" key={x} />)}
        {!loading && items.map(x => (
          <article className="story-card" key={x._id}>
            <span className="tag">{x.domain || 'Career journey'}</span>
            <h2>{x.title}</h2>
            <p>{x.story?.slice(0, 140)}{x.story?.length > 140 ? '...' : ''}</p>
            <strong>— {x.name || 'PathSeeker member'}</strong>
            <Link className="card-link" to={`/success-stories/${x._id}`}>Read full story <b>→</b></Link>
          </article>
        ))}
        {!loading && !items.length && (
          <div className="empty wide">Stories will appear here after admin approval.</div>
        )}
      </div>
    </main>
  );
}