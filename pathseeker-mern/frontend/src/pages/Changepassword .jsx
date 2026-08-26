import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ChangePassword() {
  const nav = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const submit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg('Please fill in all fields.');
      setMsgType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMsg('New password must be at least 8 characters.');
      setMsgType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg('New password and confirmation do not match.');
      setMsgType('error');
      return;
    }

    if (newPassword === currentPassword) {
      setMsg('New password must be different from your current password.');
      setMsgType('error');
      return;
    }

    setSaving(true);

    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setMsg(data.message || 'Password changed successfully.');
      setMsgType('success');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => nav('/profile'), 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          'Could not change password. Please try again.'
      );
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="li-dash">
      <div className="card li-profile-form-card" style={{ maxWidth: 480, margin: '40px auto' }}>
        <span className="eyebrow">ACCOUNT</span>
        <h2>Change password</h2>
        <p className="muted">
          Choose a new password with at least 8 characters.
        </p>

        {msg && (
          <div className={`alert ${msgType === 'error' ? 'error' : ''}`}>
            {msgType === 'error' ? '❌' : '✅'} {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn full" disabled={saving}>
            {saving ? 'Saving…' : 'Change password'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/profile">← Back to profile</Link>
        </div>
      </div>
    </main>
  );
}