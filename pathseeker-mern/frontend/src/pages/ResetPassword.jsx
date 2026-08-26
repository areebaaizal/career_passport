import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!form.password || !form.confirmPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.put(
        `/auth/reset-password/${token}`,
        {
          password: form.password,
        }
      );

      setSuccess(
        data.message ||
          'Your password has been reset successfully.'
      );

      setForm({
        password: '',
        confirmPassword: '',
      });

      // Automatically go to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset password. The link may be expired or invalid.'
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
        <h1>Reset your password</h1>

        <p className="muted">
          Create a new password for your PathSeeker
          account.
        </p>

        {/* Error */}
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="alert success">
            {success}
          </div>
        )}

        <form onSubmit={submit}>

          {/* New Password */}
          <label>
            New Password

            <div
              style={{
                position: 'relative',
                width: '100%',
              }}
            >

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Enter new password"
                style={{
                  paddingRight: '75px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>

            </div>

          </label>


          {/* Confirm Password */}
          <label>
            Confirm Password

            <div
              style={{
                position: 'relative',
                width: '100%',
              }}
            >

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                style={{
                  paddingRight: '75px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '13px',
                }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>

            </div>

          </label>


          {/* Password Requirements */}
          <div
            style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '-5px',
              marginBottom: '10px',
            }}
          >
            Password must be at least 6 characters long.
          </div>


          {/* Submit */}
          <button
            type="submit"
            className="btn full"
            disabled={loading || !!success}
          >
            {loading
              ? 'Resetting password...'
              : 'Reset password'}
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