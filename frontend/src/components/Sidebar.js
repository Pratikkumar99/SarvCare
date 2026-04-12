import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['patient', 'doctor', 'insurance', 'admin'] },
        { path: '/patient', label: 'Patient Records', icon: '🏥', roles: ['patient', 'doctor', 'admin'] },
        { path: '/doctor', label: 'Doctor Portal', icon: '👨‍⚕️', roles: ['doctor', 'admin'] },
        { path: '/insurance', label: 'Insurance Claims', icon: '📋', roles: ['insurance', 'admin'] },
        { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="sidebar bg-light border-end" style={{ minHeight: 'calc(100vh - 56px)', width: '250px' }}>
            <div className="p-3">
                <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Main Menu
                </h6>
                <ul className="nav flex-column">
                    {filteredMenu.map((item) => (
                        <li className="nav-item mb-1" key={item.path}>
                            <Link 
                                className={`nav-link d-flex align-items-center py-2 px-3 rounded ${isActive(item.path) ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                                to={item.path}
                            >
                                <span className="me-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <h6 className="text-muted text-uppercase mb-3 mt-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Quick Actions
                </h6>
                <ul className="nav flex-column">
                    {userRole === 'doctor' && (
                        <li className="nav-item mb-1">
                            <Link className="nav-link d-flex align-items-center py-2 px-3 rounded text-dark" to="/doctor">
                                <span className="me-2">📝</span>
                                New Prescription
                            </Link>
                        </li>
                    )}
                    {userRole === 'insurance' && (
                        <li className="nav-item mb-1">
                            <Link className="nav-link d-flex align-items-center py-2 px-3 rounded text-dark" to="/insurance">
                                <span className="me-2">🔍</span>
                                Review Claims
                            </Link>
                        </li>
                    )}
                    <li className="nav-item mb-1">
                        <Link className="nav-link d-flex align-items-center py-2 px-3 rounded text-dark" to="/dashboard">
                            <span className="me-2">📈</span>
                            View Reports
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
