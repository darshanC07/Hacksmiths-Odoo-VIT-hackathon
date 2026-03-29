import { useState } from 'react';
import './Dashboard.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = 'dashboard' | 'users' | 'approvals' | 'expenses';

interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}

interface Expense {
  id: number;
  employee: string;
  department: string;
  amount: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const statCards: StatCard[] = [
  {
    id: 'employees',
    title: 'Total Employees',
    value: '120',
    accent: '#6C5CE7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'expenses',
    title: 'Total Expenses',
    value: '₹45,000',
    accent: '#0ea5e9',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'pending',
    title: 'Pending Approvals',
    value: '8',
    accent: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'approved',
    title: 'Approved Requests',
    value: '32',
    accent: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

const recentExpenses: Expense[] = [
  { id: 1, employee: 'Arjun Mehta',    department: 'Engineering', amount: '₹3,200', date: '28 Mar 2026', status: 'Pending'  },
  { id: 2, employee: 'Priya Sharma',   department: 'Marketing',   amount: '₹1,800', date: '27 Mar 2026', status: 'Approved' },
  { id: 3, employee: 'Rohit Verma',    department: 'Sales',       amount: '₹5,500', date: '26 Mar 2026', status: 'Approved' },
  { id: 4, employee: 'Sneha Kapoor',   department: 'HR',          amount: '₹900',   date: '25 Mar 2026', status: 'Rejected' },
  { id: 5, employee: 'Karan Singh',    department: 'Engineering', amount: '₹2,400', date: '24 Mar 2026', status: 'Pending'  },
  { id: 6, employee: 'Divya Nair',     department: 'Finance',     amount: '₹7,100', date: '23 Mar 2026', status: 'Approved' },
];

// ─── Nav Icons ────────────────────────────────────────────────────────────────

const navIcons: Record<NavItem, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  approvals: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  expenses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
};

const navLabels: Record<NavItem, string> = {
  dashboard: 'Dashboard',
  users:     'Users',
  approvals: 'Approvals',
  expenses:  'Expenses',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SidebarProps {
  active: NavItem;
  onSelect: (item: NavItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect }) => (
  <aside className="sidebar">
    {/* Brand */}
    <div className="sidebar__brand">
      <div className="sidebar__logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <span className="sidebar__brand-name">RMS Admin</span>
    </div>

    {/* Nav */}
    <nav className="sidebar__nav">
      {(Object.keys(navIcons) as NavItem[]).map((item) => (
        <button
          key={item}
          id={`nav-${item}`}
          className={`sidebar__item${active === item ? ' sidebar__item--active' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className="sidebar__item-icon">{navIcons[item]}</span>
          <span className="sidebar__item-label">{navLabels[item]}</span>
        </button>
      ))}
    </nav>

    {/* Footer */}
    <div className="sidebar__footer">
      <div className="sidebar__avatar">A</div>
      <div className="sidebar__user-info">
        <p className="sidebar__user-name">Admin User</p>
        <p className="sidebar__user-role">Administrator</p>
      </div>
    </div>
  </aside>
);

interface StatCardProps {
  card: StatCard;
}

const StatCardItem: React.FC<StatCardProps> = ({ card }) => (
  <div className="stat-card" id={`stat-${card.id}`}>
    <div className="stat-card__icon" style={{ color: card.accent, background: `${card.accent}15` }}>
      {card.icon}
    </div>
    <div className="stat-card__body">
      <p className="stat-card__title">{card.title}</p>
      <p className="stat-card__value">{card.value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  return (
    <div className="admin-layout">
      <Sidebar
        active={activeNav}
        onSelect={setActiveNav}
      />

      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 className="admin-header__title">Admin Dashboard</h1>
            <p className="admin-header__subtitle">Overview of your company</p>
          </div>
          <div className="admin-header__actions">
            <span className="admin-header__date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Stat Cards */}
        <section className="stats-grid">
          {statCards.map((card) => (
            <StatCardItem key={card.id} card={card} />
          ))}
        </section>

        {/* Recent Expenses */}
        <section className="section-card">
          <div className="section-card__header">
            <h2 className="section-card__title">Recent Expenses</h2>
            <button className="view-all-btn" id="view-all-expenses">View All</button>
          </div>

          <div className="table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((row) => (
                  <tr key={row.id}>
                    <td className="td-num">{row.id}</td>
                    <td className="td-name">{row.employee}</td>
                    <td className="td-dept">{row.department}</td>
                    <td className="td-amount">{row.amount}</td>
                    <td className="td-date">{row.date}</td>
                    <td>
                      <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
