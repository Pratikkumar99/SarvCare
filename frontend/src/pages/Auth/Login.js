import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            const userData = response.data.user;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            // Redirect based on user role
            if (userData.role === 'insurance') {
                navigate('/insurance');
            } else if (userData.role === 'doctor') {
                navigate('/doctor');
            } else if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard'); // patient or default
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo Section */}
                <div className="auth-logo">
                    <h1 className="logo-text">SarvCare</h1>
                    <p className="logo-subtitle">Healthcare Management System</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Sign Up Link */}
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/signup" className="auth-link">Create account</Link></p>
                </div>
            </div>

            {/* Side Info Panel */}
            <div className="auth-info">
                <div className="info-content">
                    <h2>Welcome to SarvCare</h2>
                    <p>AI-powered healthcare management for patients, doctors, and insurance providers.</p>
                    
                    <div className="feature-list">
                        <div className="feature-item">
                            <span className="feature-icon"><i className="fas fa-hospital"></i></span>
                            <span>Unified Patient Records</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><i className="fas fa-robot"></i></span>
                            <span>AI Prior Authorization</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><i className="fas fa-clipboard-list"></i></span>
                            <span>Smart Claims Management</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><i className="fas fa-user-md"></i></span>
                            <span>Doctor Summary Reports</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
