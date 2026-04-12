import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ userRole }) => {
    const navigate = useNavigate();

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
                        <li className="nav-item">
                            <button 
                                className="btn btn-outline-light btn-sm" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
