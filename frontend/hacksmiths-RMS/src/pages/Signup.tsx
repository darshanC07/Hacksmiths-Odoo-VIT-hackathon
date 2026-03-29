import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialForm: FormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const navigate = useNavigate();

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
    return errs;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // No API call — log and show success state
    console.log('Signup form data:', formData);
    setSubmitted(true);
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="signup-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="signup-card success-card">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="success-title">Account Created!</h2>
          <p className="success-msg">Your details have been logged. You can now sign in.</p>
          <button id="goto-login-btn" className="submit-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Shared password-toggle icon ──────────────────────────────────────────────
  const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOff = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="signup-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="signup-card">
        {/* Brand mark */}
        <div className="signup-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
        </div>

        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join the Reimbursement Management System</p>

        <form id="signup-form" className="signup-form" onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className={`form-group${errors.fullName ? ' form-group--error' : ''}`}>
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className={`form-group${errors.email ? ' form-group--error' : ''}`}>
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          {/* Password row */}
          <div className="form-row">
            {/* Password */}
            <div className={`form-group${errors.password ? ' form-group--error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass((p) => !p)} tabIndex={-1}>
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={`form-group${errors.confirmPassword ? ' form-group--error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}>
                  {showConfirm ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Company Name */}
          <div className={`form-group${errors.companyName ? ' form-group--error' : ''}`}>
            <label htmlFor="companyName">Company Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
          </div>

          <button id="create-account-btn" type="submit" className="submit-btn">
            Create Account
          </button>
        </form>

        <div className="signup-login-link">
          <span>Already have an account?</span>
          <button id="back-to-home-btn" className="text-link-btn" onClick={() => navigate('/')}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
