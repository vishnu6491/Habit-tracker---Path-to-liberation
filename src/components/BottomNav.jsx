import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const links = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/habits', icon: '', label: 'Habits' },
    { to: '/calendar', icon: '📅', label: 'Calendar' },
    { to: '/shop', icon: '🛒', label: 'Shop' },
    { to: '/reports', icon: '📊', label: 'Reports' },
    { to: '/settings', icon: '️', label: 'Settings' }
  ];

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
