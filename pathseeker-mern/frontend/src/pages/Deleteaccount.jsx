import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CONSEQUENCES = [
  'Your profile, education, skills, and career preferences will be permanently erased',
  'Your quiz history, bookmarks, and recently viewed items will be lost',
  'Your uploaded resume will be deleted from our servers',
  'This action cannot be undone — there is no recovery period',
];

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [msg, setMsg] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canSubmit = password.length > 0 && understood && confirmText.trim().toUpperCase() === 'DELETE';

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setMsg(null);
    setDeleting(true);
    try {
      await api.delete('/auth/account', { data: { password } });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not delete account. Please check your password and try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>PS</span>
          <div>
            <strong>Delete account</strong>
            <small>This is permanent — please read carefully</small>
          </div>
        </div>

        <div className="alert error">
          <strong>Warning:</strong> deleting your account cannot be reversed.
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
            {CONSEQUENCES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        {msg && <div className="alert error">{msg}</div>}

        <form onSubmit={submit}>
          <label>
            Confirm your password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>

          <label>
            Type DELETE to confirm
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" required />
          </label>

          <div className="form-row">
            <label className="check">
              <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
              I understand this action is permanent and cannot be undone
            </label>
          </div>

          <button className="btn full danger" disabled={!canSubmit || deleting}>
            {deleting ? 'Deleting account…' : 'Permanently delete my account'}
          </button>
        </form>

        <p className="auth-bottom">
          <Link to="/profile">← No, take me back to my profile</Link>
        </p>
      </div>
    </div>
  );
}