import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = ({ userRole, user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'doctor': return 'badge-doctor';
      case 'insurance': return 'badge-insurance';
      default: return 'badge-patient';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'doctor': return 'Doctor';
      case 'insurance': return 'Insurance';
      case 'patient': return 'Patient';
      default: return 'User';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/dashboard">
          SarvCare
        </Link>
        
        <div className="navbar-actions">
          {/* Role Badge */}
          {userRole && (
            <span className={`role-badge ${getRoleBadgeClass(userRole)}`}>
              {getRoleLabel(userRole)}
            </span>
          )}
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Profile Dropdown */}
          <div className="profile-dropdown" ref={dropdownRef}>
            <button 
              className="profile-btn" 
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
            >
              <span className="profile-name">{user?.name || 'User'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu show">
                <div className="dropdown-header">
                  <span className="dropdown-name">{user?.name || 'User'}</span>
                  <span className="dropdown-email">{user?.email || ''}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  Profile
                </Link>
                <Link to="/dashboard" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  Dashboard
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item text-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;