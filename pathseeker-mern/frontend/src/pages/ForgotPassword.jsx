import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      // Backend route is POST /forgot-password
      const { data } = await api.post(
        '/auth/forgot-password',
        {
          email: email.trim(),
        }
      );

      setMessage(
        data.message ||
          'If an account exists with this email, a password reset link has been sent.'
      );

    } catch (err) {
      console.error(
        'Forgot password error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to process your request. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <section className="auth-card">

        {/* Brand */}
        <div className="auth-brand">

          <span>PS</span>

          <div>
            <strong>PathSeeker</strong>
            <small>
              Discover What Fits You Best.
            </small>
          </div>

        </div>

        {/* Heading */}
        <h1>Forgot your password?</h1>

        <p className="muted">
          Enter the email address associated with your
          account and we'll send you a password reset link.
        </p>

        {/* Error */}
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="alert success">
            {message}
          </div>
        )}

        <form onSubmit={submit}>

          {/* Email */}
          <label>
            Email

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              disabled={loading}
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="btn full"
            disabled={loading}
          >
            {loading
              ? 'Sending reset link...'
              : 'Send reset link'}
          </button>

        </form>

        {/* Back to Login */}
        <p className="auth-bottom">
          Remember your password?{' '}

          <Link to="/login">
            Back to Login
          </Link>
        </p>

      </section>

    </main>
  );
}