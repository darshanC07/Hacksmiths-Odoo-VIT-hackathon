import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMember, getManagers, getCompanyMembers } from '../../Global Api/globalApi';
import ApprovalRulesModal from './ApprovalRulesModal';
import './Dashboard.css'; // Inheriting layout styles
import './Users.css'; // Users specific styles

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = 'dashboard' | 'users' | 'approvals' | 'expenses';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Employee' | 'Manager';
  manager: string;
  status: 'Active' | 'Inactive';
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const initialUsers: User[] = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.s@example.com', role: 'Employee', manager: 'Amit Singh', status: 'Active' },
  { id: 2, name: 'Priya Mehta', email: 'priya.m@example.com', role: 'Manager', manager: '-', status: 'Active' },
  { id: 3, name: 'Amit Singh', email: 'amit.s@example.com', role: 'Manager', manager: '-', status: 'Active' },
  { id: 4, name: 'Neha Gupta', email: 'neha.g@example.com', role: 'Employee', manager: 'Priya Mehta', status: 'Active' }
];

// (Removed static managersList in favor of state)

// ─── Nav Icons (Reused from Dashboard) ────────────────────────────────────────

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

// ─── Sidebar Component (Reused from Dashboard) ──────────────────────────────────

interface SidebarProps {
  active: NavItem;
  onSelect: (item: NavItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect }) => (
  <aside className="sidebar">
    <div className="sidebar__brand">
      <div className="sidebar__logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <span className="sidebar__brand-name">RMS Admin</span>
    </div>

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

    <div className="sidebar__footer">
      <div className="sidebar__avatar">A</div>
      <div className="sidebar__user-info">
        <p className="sidebar__user-name">Admin User</p>
        <p className="sidebar__user-role">Administrator</p>
      </div>
    </div>
  </aside>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminUsers: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('users');
  const navigate = useNavigate();

  const handleNavSelect = (item: NavItem) => {
    setActiveNav(item);
    if (item === 'dashboard') navigate('/admin');
    if (item === 'users') navigate('/admin/users');
  };

  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fallback to "ethdc" just in case local storage is empty for testing
        const company = localStorage.getItem("company") || "ethdc";
        const members = await getCompanyMembers(company);
        
        let membersArray: any[] = [];
        
        // Check if data matches standard Hackathon backend struct: { data: { employees: [], managers: [] } }
        if (members?.data?.employees || members?.data?.managers) {
          const emp = (members.data.employees || []).map((user: any) => ({ ...user, role: 'Employee' }));
          const mgr = (members.data.managers || []).map((user: any) => ({ ...user, role: 'Manager' }));
          membersArray = [...emp, ...mgr];
        } else if (Array.isArray(members)) {
          membersArray = members;
        } else if (members && typeof members === 'object') {
          membersArray = members.members || members.users || members.data || [];
          if (!Array.isArray(membersArray)) membersArray = [];
        }
        
        setUsers(membersArray);
      } catch (err) {
        console.error("Failed to load company members", err);
      }
    };
    
    fetchUsers();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [managersList, setManagersList] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee' as 'Employee' | 'Manager',
    manager: '',
  });

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const company = localStorage.getItem("company") || "ethdc";
      const managers = await getManagers(company);
      
      let mgrArray = [];
      if (Array.isArray(managers)) {
        mgrArray = managers;
      } else if (managers?.data && Array.isArray(managers.data)) {
        mgrArray = managers.data;
      }
      
      setManagersList(mgrArray);
    } catch (err) {
      console.error("Failed to fetch managers", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset manager field when switching to Manager role
      ...(name === 'role' && value === 'Manager' ? { manager: '-' } : {})
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const company = localStorage.getItem("company") || "ethdc";
    
    try {
      if (formData.role === 'Manager') {
        await addMember({
          email: formData.email,
          company: company,
          role: "manager",
          name: formData.name
        });
        console.log("Added manager:", formData.email);
      } else {
        await addMember({
          manager_uid: formData.manager,
          email: formData.email,
          company: company,
          role: "employee",
          name: formData.name
        });
        console.log("Added employee:", formData.email);
      }

      // Update local UI state
      const newUser: User = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        manager: formData.role === 'Employee' ? formData.manager : '-',
        status: 'Active'
      };
      
      setUsers([...users, newUser]);
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'Employee',
        manager: '',
      });
    } catch (err: any) {
      console.error("Add member API failed:", err);
      const backendError = err?.response?.data?.error || err?.response?.data?.message || err.message;
      alert(`Failed! Backend Error: ${backendError}`);
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) =>
    (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getManagerName = (managerId: string) => {
    if (!managerId || managerId === '-') return '-';
    // Find the manager object inside the full user list
    const mgr = users.find((u) => u.uid === managerId && u.role === 'Manager');
    return mgr ? mgr.name : managerId;
  };

  return (
    <div className="admin-layout">
      {/* Reusing Sidebar */}
      <Sidebar active={activeNav} onSelect={handleNavSelect} />

      <main className="admin-main">
        {/* Top Header Section */}
        <header className="admin-header">
          <div>
            <h1 className="admin-header__title">User Management</h1>
            <p className="admin-header__subtitle">Manage employees and managers</p>
          </div>
          
          <div className="top-actions">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-primary" onClick={handleOpenModal}>
              Add User
            </button>
          </div>
        </header>

        {/* User Table Section */}
        <section className="section-card">
          <div className="table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Manager</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.uid || user.id || idx}>
                      <td className="td-name">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{getManagerName(user.manager || user.manager_uid)}</td>
                      <td>
                        <button 
                          className="action-btn" 
                          style={{ 
                            padding: '6px 12px', 
                            background: 'rgba(108, 92, 231, 0.1)', 
                            color: '#6C5CE7', 
                            border: '1px solid rgba(108, 92, 231, 0.2)', 
                            borderRadius: '6px',
                            fontWeight: '500'
                          }}
                          onClick={() => alert(`Password reset link sent to ${user.email}!`)}
                        >
                          Send Password
                        </button>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => setEditingUser(user)}>Edit</button>
                        <button className="action-btn delete">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  placeholder="Enter email address" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role" 
                  className="form-control" 
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* Conditional Manager Field */}
              {formData.role === 'Employee' && (
                <div className="form-group">
                  <label>Assign Manager</label>
                  <select 
                    name="manager" 
                    className="form-control"
                    value={formData.manager}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select a manager</option>
                    {(Array.isArray(managersList) ? managersList : []).map((manager, idx) => (
                      <option key={idx} value={manager?.uid || manager?.id || manager?.email || idx}>
                        {manager?.name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Approval Rules Modal */}
      {editingUser && (
        <ApprovalRulesModal 
          user={editingUser} 
          allUsers={users} 
          onClose={() => setEditingUser(null)} 
        />
      )}
    </div>
  );
};

export default AdminUsers;
