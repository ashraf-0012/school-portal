import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ShieldCrestIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '../../components/icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(
        'Please enter both your email address and password.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (!res.ok) {
        setErrorMessage(
          res.error ||
            'Authentication failed. Please verify your credentials.'
        );
        setLoading(false);
        return;
      }

      // Navigate to the role verified by the backend.
      navigate(`/${res.role}`, { replace: true });
    } catch (err) {
      setErrorMessage(
        'Unable to reach authentication server. Please ensure the backend is running.'
      );
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex-center"
      style={{
        backgroundColor: 'var(--color-bg-cream)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* School Crest and Branding */}
        <div
          className="flex-col items-center gap-2"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Link to="/" className="school-crest school-crest-lg">
            <ShieldCrestIcon size={32} />
          </Link>

          <h1
            className="heading-md"
            style={{
              color: 'var(--color-navy-900)',
              marginTop: 'var(--space-2)',
            }}
          >
            Crestfield Academy
          </h1>

          <p
            className="text-muted"
            style={{ fontSize: '0.875rem' }}
          >
            Official School Portal Authentication
          </p>

          <div className="flex items-center gap-2">
            <Badge variant="navy">Admin</Badge>
            <Badge variant="gold">Teacher</Badge>
            <Badge variant="sky">Student</Badge>
          </div>
        </div>

        {/* Login Card */}
        <Card featured className="p-8">
          <h2
            className="heading-sm"
            style={{
              marginBottom: 'var(--space-1)',
              color: 'var(--color-navy-900)',
            }}
          >
            Portal Sign In
          </h2>

          <p
            className="text-muted"
            style={{
              fontSize: '0.8125rem',
              marginBottom: 'var(--space-6)',
            }}
          >
            Enter your credentials to access your academic dashboard.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(185, 28, 28, 0.2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="login-email"
              >
                Email Address
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@school.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  required
                />

                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <MailIcon size={18} />
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="login-password"
              >
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '2.75rem',
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LockIcon size={18} />
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="gold"
              size="lg"
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ marginTop: 'var(--space-2)' }}
            >
              {loading
                ? 'Authenticating with Backend...'
                : 'Sign In to Portal'}
            </Button>
          </form>

          {/* Registration and Other Links */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              textAlign: 'center',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 'var(--space-4)',
            }}
          >
            <p
              className="text-muted"
              style={{
                fontSize: '0.8125rem',
                marginBottom: 'var(--space-3)',
              }}
            >
              Don't have a student account?{' '}
              <Link
                to="/register"
                style={{
                  fontWeight: 600,
                  color: 'var(--color-navy-700)',
                }}
              >
                Create an account
              </Link>
            </p>

            <p
              className="text-muted"
              style={{ fontSize: '0.8125rem' }}
            >
              Lost your credentials? Please contact the school
              administrative desk.
            </p>

            <Link
              to="/"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-navy-700)',
                display: 'inline-block',
                marginTop: '4px',
              }}
            >
              ← Return to School Homepage
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}