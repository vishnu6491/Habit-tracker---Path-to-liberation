import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = ({ hasWarning }) => {
  const links = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/habits', icon: '📜', label: 'Habits' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
    { to: '/shop', icon: '🛒', label: 'Shop' },
    { to: '/reports', icon: '📊', label: 'Reports' },
    { to: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon" style={{ position: 'relative', display: 'inline-block' }}>
            {link.icon}
            
            {/* Warning Badge for Calendar */}
            {link.label === 'Calendar' && hasWarning && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                fontSize: '10px',
                background: '#f44336',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid var(--bg-dark)',
                boxShadow: '0 0 5px rgba(244, 67, 54, 0.5)'
              }}>
                !
              </span>
            )}
          </span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
