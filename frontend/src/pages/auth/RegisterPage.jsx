import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  ShieldCrestIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '../../components/icons';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage('');
    setSuccessMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email || !formData.password ||
        !formData.confirmPassword) {
      setErrorMessage('Please complete all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage(
        'Your password must contain at least 6 characters.'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name,
        email,
        password: formData.password,
      });

      if (!result?.ok) {
        setErrorMessage(
          result?.error ||
            'Registration failed. Please try again.'
        );
        return;
      }

      setSuccessMessage(
        'Your student account has been created successfully.'
      );

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message:
              'Registration successful. You can now sign in.',
          },
        });
      }, 1200);
    } catch (error) {
      setErrorMessage(
        'Unable to reach the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const inputIconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-light)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const passwordToggleStyle = {
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
  };

  return (
    <div
      className="min-h-screen flex-center"
      style={{
        backgroundColor: 'var(--color-bg-cream)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        {/* School Branding */}
        <div
          className="flex-col items-center gap-2"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Link
            to="/"
            className="school-crest school-crest-lg"
            aria-label="Return to Crestfield Academy homepage"
          >
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
            Official School Portal
          </p>

          <div
            style={{
              width: '48px',
              height: '3px',
              backgroundColor: 'var(--color-gold-500)',
              borderRadius: '999px',
              marginTop: 'var(--space-1)',
            }}
          />
        </div>

        {/* Registration Card */}
        <Card featured className="p-8">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2
              className="heading-sm"
              style={{
                marginBottom: 'var(--space-1)',
                color: 'var(--color-navy-900)',
              }}
            >
              Create Your Account
            </h2>

            <p
              className="text-muted"
              style={{ fontSize: '0.8125rem' }}
            >
              Register as a student to access your school portal.
            </p>
          </div>

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

          {/* Success Message */}
          {successMessage && (
            <div
              role="status"
              style={{
                backgroundColor: '#ecfdf5',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-name"
              >
                Full Name
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                  required
                />

                <span style={inputIconStyle}>
                  <ShieldCrestIcon size={18} />
                </span>
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-email"
              >
                Email Address
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@school.ng"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                />

                <span style={inputIconStyle}>
                  <MailIcon size={18} />
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-password"
              >
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '2.75rem',
                  }}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />

                <span style={inputIconStyle}>
                  <LockIcon size={18} />
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  style={passwordToggleStyle}
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

            {/* Confirm Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="register-confirm-password"
              >
                Confirm Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword ? 'text' : 'password'
                  }
                  className="form-control"
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '2.75rem',
                  }}
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />

                <span style={inputIconStyle}>
                  <LockIcon size={18} />
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  style={passwordToggleStyle}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirmation password'
                      : 'Show confirmation password'
                  }
                >
                  {showConfirmPassword ? (
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
                ? 'Creating Your Account...'
                : 'Create Student Account'}
            </Button>
          </form>

          {/* Footer Links */}
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
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  fontWeight: 600,
                  color: 'var(--color-navy-700)',
                }}
              >
                Sign in
              </Link>
            </p>

            <Link
              to="/"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-navy-700)',
                display: 'inline-block',
              }}
            >
              ← Return to School Homepage
            </Link>
          </div>
        </Card>

        <p
          className="text-muted"
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            marginTop: 'var(--space-4)',
          }}
        >
          Student registration for Crestfield Academy.
        </p>
      </div>
    </div>
  );
}