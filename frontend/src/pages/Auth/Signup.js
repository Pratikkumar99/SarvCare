import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const Signup = ({ setUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        abhaId: '',
        password: '',
        confirmPassword: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        { value: 'patient', label: 'Patient', desc: 'Access your medical records' },
        { value: 'doctor', label: 'Doctor', desc: 'Manage patients & prescriptions' },
        { value: 'insurance', label: 'Insurance', desc: 'Process claims & approvals' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Register user via API
            const response = await authAPI.register({
                name: formData.fullName,
                email: formData.email,
                abhaId: formData.abhaId,
                password: formData.password,
                role: formData.role
            });

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
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo Section */}
                <div className="auth-logo">
                    <h1 className="logo-text">SarvCare</h1>
                    <p className="logo-subtitle">Create your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            required
                            disabled={loading}
                        />
                    </div>

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
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter your age"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            required
                            disabled={loading}
                            min="1"
                            max="120"
                        />
                    </div>

                    {/* ABHA ID */}
                    <div className="form-group">
                        <label className="form-label">
                            ABHA ID (Ayushman Bharat Health Account)
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter ABHA ID (e.g., ABHA-1234-5678-9012)"
                            value={formData.abhaId}
                            onChange={(e) => setFormData({...formData, abhaId: e.target.value})}
                            disabled={loading}
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="form-group">
                        <label className="form-label">Select Your Role</label>
                        <div className="role-selection">
                            {roles.map((role) => (
                                <div
                                    key={role.value}
                                    className={`role-card ${formData.role === role.value ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, role: role.value})}
                                >
                                    <span className="role-label">{role.label}</span>
                                    <small className="role-desc">{role.desc}</small>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group half">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="terms-checkbox">
                            <input type="checkbox" required />
                            <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
                </div>
            </div>

            {/* Side Info Panel */}
            <div className="auth-info">
                <div className="info-content">
                    <h2>Join SarvCare</h2>
                    <p>Create an account to access personalized healthcare services.</p>
                    
                    <div className="benefits-list">
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>Secure medical record access</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>AI-asssistant</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>24/7 healthcare management</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>Role-based secure access</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
