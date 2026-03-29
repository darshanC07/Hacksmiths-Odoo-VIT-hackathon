import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'employee' | 'manager' | 'admin';

interface RoleOption {
  id: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const roles: RoleOption[] = [
  {
    id: 'employee',
    label: 'Employee',
    description: 'Submit & track expense claims',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Review & approve reimbursements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Manage users, policies & reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Landing: React.FC = () => {
  const [selected, setSelected] = useState<Role | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: Role): void => {
    setSelected(roleId);
    setTimeout(() => {
      navigate(`/login?role=${roleId}`);
    }, 300);
  };

  return (
    <div className="landing-root">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="landing-card">
        {/* Brand mark */}
        <div className="landing-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
        </div>

        <h1 className="landing-title">Reimbursement Management System</h1>
        <p className="landing-subtitle">Select your role to continue</p>

        <div className="role-grid">
          {roles.map((role) => (
            <button
              key={role.id}
              id={`role-${role.id}`}
              className={`role-card${selected === role.id ? ' role-card--selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="role-card__icon">{role.icon}</div>
              <span className="role-card__label">{role.label}</span>
              <span className="role-card__desc">{role.description}</span>
              <div className="role-card__check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="landing-divider">
          <span>New to the platform?</span>
        </div>

        <p className="landing-signup-text">Don&apos;t have an account?</p>
        <button
          id="signup-btn"
          className="signup-btn"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Landing;
