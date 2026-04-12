import React, { useEffect, useState } from 'react';
import { patientAPI, doctorAPI, insuranceAPI } from '../services/api';

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({
        patients: 0,
        claims: 0,
        prescriptions: 0,
        pendingClaims: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [patientsRes, claimsRes] = await Promise.all([
                patientAPI.getAll(),
                insuranceAPI.getAllClaims()
            ]);

            const patients = patientsRes.data.patients || [];
            const claims = claimsRes.data.claims || [];
            const pendingClaims = claims.filter(c => c.status === 'pending').length;

            setStats({
                patients: patients.length,
                claims: claims.length,
                prescriptions: 0,
                pendingClaims
            });

            // Generate recent activity
            const activity = [
                ...claims.slice(0, 5).map(c => ({
                    type: 'claim',
                    description: `${c.treatment} claim ${c.status} for ${c.patient_name}`,
                    date: c.created_at,
                    status: c.status
                }))
            ];
            setRecentActivity(activity);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Admin Panel</h2>
                <span className="badge bg-danger">Administrator Access</span>
            </div>

            {/* Stats Overview */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">Total Patients</h6>
                                    <h3 className="mb-0">{stats.patients}</h3>
                                </div>
                                <div className="display-6">🏥</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">Total Claims</h6>
                                    <h3 className="mb-0">{stats.claims}</h3>
                                </div>
                                <div className="display-6">📋</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1">Pending Review</h6>
                                    <h3 className="mb-0">{stats.pendingClaims}</h3>
                                </div>
                                <div className="display-6">⏳</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">System Status</h6>
                                    <h3 className="mb-0">✓</h3>
                                </div>
                                <div className="display-6">⚙️</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* System Management */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">System Management</h5>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <a href="/patient" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">Manage Patients</h6>
                                        <small className="text-muted">View and edit patient records</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">{stats.patients}</span>
                                </a>
                                <a href="/doctor" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">Doctor Portal</h6>
                                        <small className="text-muted">Manage prescriptions and summaries</small>
                                    </div>
                                    <span className="badge bg-success rounded-pill">Active</span>
                                </a>
                                <a href="/insurance" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">Insurance Claims</h6>
                                        <small className="text-muted">Review and process claims</small>
                                    </div>
                                    <span className="badge bg-warning rounded-pill">{stats.pendingClaims}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Activity</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={fetchAdminData}>Refresh</button>
                        </div>
                        <div className="card-body">
                            {recentActivity.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <span className={`badge bg-${activity.status === 'approved' ? 'success' : activity.status === 'rejected' ? 'danger' : 'warning'} me-2`}>
                                                        {activity.status}
                                                    </span>
                                                    <span>{activity.description}</span>
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI System Status */}
            <div className="card">
                <div className="card-header bg-white">
                    <h5 className="mb-0">🤖 AI Prior Authorization System</h5>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                    ✓
                                </div>
                                <div>
                                    <h6 className="mb-0">Rule Engine</h6>
                                    <small className="text-muted">Active</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                    ✓
                                </div>
                                <div>
                                    <h6 className="mb-0">Claim Analysis</h6>
                                    <small className="text-muted">Processing</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                    ✓
                                </div>
                                <div>
                                    <h6 className="mb-0">Auto-Approval</h6>
                                    <small className="text-muted">Enabled</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h6>AI Logic Rules:</h6>
                        <ul className="list-unstyled text-muted">
                            <li>✓ Chronic condition + Preventive care = Auto-Approve</li>
                            <li>⚠ High-cost procedures without history = Flag for Review</li>
                            <li>✓ Low-cost preventive care = Auto-Approve</li>
                            <li>? Insufficient data = Manual Review</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
