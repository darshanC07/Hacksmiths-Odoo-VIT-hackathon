import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', padding: '40px', background: '#f9f9fb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#111827', marginBottom: '10px' }}>Manager Dashboard</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>Welcome! This is your completely blank manager portal placeholder. Here you will be able to review and approve expense reports.</p>
        
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '12px 24px', 
            background: '#6C5CE7', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#5a4bd1'}
          onMouseOut={(e) => e.currentTarget.style.background = '#6C5CE7'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ManagerDashboard;
