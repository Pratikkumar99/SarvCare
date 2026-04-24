import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = ({ userRole, user }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-danger';
            case 'doctor': return 'bg-success';
            case 'insurance': return 'bg-warning text-dark';
            default: return 'bg-primary';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '⚙️';
            case 'doctor': return '👨‍⚕️';
            case 'insurance': return '📋';
            case 'patient': return '🏥';
            default: return '👤';
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    <span className="me-2">🏥</span>
                    SarvCare
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {userRole && (
                            <li className="nav-item me-3">
                                <span className={`badge ${getRoleBadgeColor(userRole)} px-3 py-2`}>
                                    {userRole?.toUpperCase()}
                                </span>
                            </li>
                        )}
                        
                        <li className="nav-item me-3">
                            <ThemeToggle />
                        </li>
                        
                        <li className="nav-item" ref={dropdownRef}>
                            <div className="profile-dropdown">
                                <button 
                                    className="btn-gradient profile-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    aria-expanded={showDropdown}
                                >
                                    <span className="profile-icon">{getRoleIcon(userRole)}</span>
                                    <span className="profile-name">{user?.name || 'User'}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>
                                
                                {showDropdown && (
                                    <div className="dropdown-menu show">
                                        <div className="dropdown-header">
                                            <span className="dropdown-icon">{getRoleIcon(userRole)}</span>
                                            <div>
                                                <span className="dropdown-name">{user?.name}</span>
                                                <span className="dropdown-email">{user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <span className="item-icon">👤</span>
                                            View Profile
                                        </Link>
                                        <Link 
                                            to="/dashboard" 
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <span className="item-icon">📊</span>
                                            Dashboard
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button 
                                            className="dropdown-item logout-item"
                                            onClick={handleLogout}
                                        >
                                            <span className="item-icon">🚪</span>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;