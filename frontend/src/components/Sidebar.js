import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userRole }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['patient', 'doctor', 'insurance', 'admin'] },
    { path: '/patient', label: 'Patient Records', roles: ['patient', 'doctor', 'admin'] },
    { path: '/doctor', label: 'Doctor Portal', roles: ['doctor', 'admin'] },
    { path: '/insurance', label: 'Insurance Claims', roles: ['insurance', 'admin'] },
    { path: '/admin', label: 'Admin Panel', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Main Menu */}
        <div className="sidebar-section">
          <h6 className="sidebar-heading">Main Menu</h6>
          <ul className="sidebar-nav">
            {filteredMenu.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="sidebar-section">
          <h6 className="sidebar-heading">Quick Actions</h6>
          <ul className="sidebar-nav">
            {userRole === 'doctor' && (
              <li>
                <Link to="/doctor" className="sidebar-link">New Prescription</Link>
              </li>
            )}
            {userRole === 'insurance' && (
              <li>
                <Link to="/insurance" className="sidebar-link">Review Claims</Link>
              </li>
            )}
            <li>
              <Link to="/dashboard" className="sidebar-link">View Reports</Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;