import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        age: user?.age || '',
        role: user?.role || '',
        phone: '',
        address: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({
        patientsSeen: 0,
        prescriptions: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update user in localStorage and state
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
        
        setTimeout(() => setMessage(''), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const clearLocalStorage = () => {
        localStorage.clear();
        window.location.reload();
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#e53e3e';
            case 'doctor': return '#38a169';
            case 'insurance': return '#dd6b20';
            case 'patient': return '#3182ce';
            default: return '#718096';
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <div className="profile-actions">
                    <button 
                        type="button" 
                        className="btn btn-warning btn-sm"
                        onClick={clearLocalStorage}
                        title="Clear all localStorage data"
                    >
                        🗑️ Clear Data
                    </button>
                    <button 
                        type="button" 
                        className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {message && (
                <div className="alert alert-success" role="alert">
                    {message}
                </div>
            )}

            <div className="profile-card">
                {/* Profile Header Card */}
                <div className="profile-hero">
                    <div 
                        className="profile-avatar"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                        <span className="avatar-letter">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <span 
                            className="profile-role-badge"
                            style={{ backgroundColor: getRoleColor(user.role) + '20' }}
                        >
                            {user.role?.toUpperCase()}
                        </span>
                        <p className="profile-email">{user.email}</p>
                        {user.abha_id && (
                            <p className="profile-abha">
                                <span className="abha-label">ABHA ID:</span>
                                <span className="abha-value">{user.abha_id}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h4>Basic Information</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                ) : (
                                    <p className="form-value">{formData.name}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                ) : (
                                    <p className="form-value">{formData.email}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Age</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="form-control"
                                        min="1"
                                        max="120"
                                    />
                                ) : (
                                    <p className="form-value">{user?.age || 'Not provided'} years</p>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="form-value">{formData.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <p className="form-value role-value">
                                    <span className="role-dot" style={{ backgroundColor: getRoleColor(user.role) }}></span>
                                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Additional Information</h4>
                        <div className="form-group full-width">
                            <label>Address</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Enter your address"
                                />
                            ) : (
                                <p className="form-value">{formData.address || 'Not provided'}</p>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Bio / About</label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="form-control"
                                    rows="3"
                                    placeholder="Tell us about yourself"
                                />
                            ) : (
                                <p className="form-value">{formData.bio || 'No bio added yet'}</p>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

                {/* Account Stats */}
                <div className="profile-stats">
                    <h4>Account Statistics</h4>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-number">{stats?.patientsSeen || 0}</span>
                            <span className="stat-label">
                                {user.role === 'patient' ? 'Total Visits' : 
                                 user.role === 'doctor' ? 'Patients Seen' : 
                                 user.role === 'insurance' ? 'Claims Processed' : 'System Users'}
                            </span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{stats?.prescriptions || 0}</span>
                            <span className="stat-label">
                                {user.role === 'patient' ? 'Prescriptions' : 
                                 user.role === 'doctor' ? 'Prescriptions' : 
                                 user.role === 'insurance' ? 'Approved' : 'Active Sessions'}
                            </span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{new Date().getFullYear()}</span>
                            <span className="stat-label">Member Since</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                    <h4>Danger Zone</h4>
                    <div className="danger-actions">
                        <div className="danger-item">
                            <div>
                                <h5>Change Password</h5>
                                <p>Update your account password</p>
                            </div>
                            <button className="btn btn-outline-danger btn-sm">
                                Change Password
                            </button>
                        </div>
                        <div className="danger-item">
                            <div>
                                <h5>Logout</h5>
                                <p>Sign out of your account</p>
                            </div>
                            <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    setUser(null);
                                    navigate('/login');
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
