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
        await new Promise(resolve => setTimeout(resolve, 500));
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

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'doctor': return 'Doctor';
            case 'insurance': return 'Insurance Staff';
            case 'patient': return 'Patient';
            default: return 'User';
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
                        className={`btn-edit ${isEditing ? 'cancel' : 'edit'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            <div className="profile-card">
                {/* Profile Header */}
                <div className="profile-hero">
                    <div className="profile-avatar">
                        <span className="avatar-letter">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="profile-info">
                        <h3>{user.name}</h3>
                        <span className="profile-role-badge">
                            {getRoleLabel(user.role)}
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
                                    {getRoleLabel(user.role)}
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
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

                {/* Danger Zone */}
                <div className="danger-zone">
                    <h4>Danger Zone</h4>
                    <div className="danger-actions">
                        <div className="danger-item">
                            <div>
                                <h5>Change Password</h5>
                                <p>Update your account password</p>
                            </div>
                            <button className="btn-outline-danger">
                                Change Password
                            </button>
                        </div>
                        <div className="danger-item">
                            <div>
                                <h5>Logout</h5>
                                <p>Sign out of your account</p>
                            </div>
                            <button 
                                className="btn-outline-danger"
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