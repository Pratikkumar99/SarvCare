import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI, insuranceAPI, doctorAPI } from '../../services/api';
import PatientCard from '../../components/PatientCard';
import ClaimCard from '../../components/ClaimCard';
import PatientDashboard from '../PatientDashboard';
import './Dashboard.css';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        totalValue: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentClaims, setRecentClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [patientsRes, claimsRes, prescriptionsRes, reportsRes] = await Promise.all([
                patientAPI.getAll(user?.id, user?.role),
                insuranceAPI.getAll(user?.id, user?.role),
                user?.role === 'doctor' ? doctorAPI.getPrescriptions(user?.id) : Promise.resolve({ data: [] }),
                user?.role === 'doctor' ? doctorAPI.getReports(user?.id) : Promise.resolve({ data: [] })
            ]);

            const patients = patientsRes.data.patients || [];
            const claims = claimsRes.data.claims || [];
            const prescriptions = prescriptionsRes.data.prescriptions || [];
            const reports = reportsRes.data.reports || [];

            const pendingClaims = claims.filter(c => c.status === 'pending').length;
            const approvedClaims = claims.filter(c => c.status === 'approved').length;
            const totalValue = claims.reduce((sum, c) => sum + parseFloat(c.cost || 0), 0);

            // For doctors: count prescriptions and reports
            const totalPrescriptions = user?.role === 'doctor' ? prescriptions.length : 0;
            const totalReports = user?.role === 'doctor' ? reports.length : 0;

            setStats({
                totalPatients: patients.length,
                totalClaims: claims.length,
                pendingClaims,
                approvedClaims,
                totalPrescriptions,
                totalReports,
                totalValue
            });

            setRecentPatients(patients.slice(0, 3));
            setRecentClaims(claims.slice(0, 3));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleDashboard = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard user={user} stats={stats} recentPatients={recentPatients} recentClaims={recentClaims} />;
            case 'doctor':
                return <DoctorDashboard user={user} stats={stats} recentPatients={recentPatients} />;
            case 'insurance':
                return <InsuranceDashboard user={user} stats={stats} recentClaims={recentClaims} />;
            case 'patient':
                return <PatientDashboard user={user} stats={stats} recentPatients={recentPatients} recentClaims={recentClaims} />;
            default:
                return <DefaultDashboard stats={stats} />;
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {getRoleDashboard()}
        </div>
    );
};

// Admin Dashboard
const AdminDashboard = ({ user, stats, recentPatients, recentClaims }) => (
    <div className="role-dashboard admin-dashboard">
        <div className="dashboard-header">
            <div>
                <h2 className="dashboard-title">Admin Dashboard</h2>
                <p className="dashboard-subtitle">System overview and management</p>
            </div>
            <span className="role-badge admin">Administrator</span>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
            <StatCard icon="🏥" value={stats.totalPatients} label="Total Patients" color="primary" />
            <StatCard icon="📋" value={stats.totalClaims} label="Total Claims" color="success" />
            <StatCard icon="⏳" value={stats.pendingClaims} label="Pending Review" color="warning" />
            <StatCard icon="💰" value={`$${stats.totalValue.toLocaleString()}`} label="Total Value" color="info" />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
                <Link to="/patient" className="action-btn">
                    <span className="action-icon">🏥</span>
                    <span>Manage Patients</span>
                </Link>
                <Link to="/doctor" className="action-btn">
                    <span className="action-icon">👨‍⚕️</span>
                    <span>Doctor Portal</span>
                </Link>
                <Link to="/insurance" className="action-btn">
                    <span className="action-icon">📋</span>
                    <span>Review Claims</span>
                </Link>
                <Link to="/admin" className="action-btn">
                    <span className="action-icon">⚙️</span>
                    <span>System Settings</span>
                </Link>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-sections">
            <div className="section-card">
                <div className="section-header">
                    <h4>Recent Patients</h4>
                    <Link to="/patient" className="view-all">View All →</Link>
                </div>
                <div className="section-content">
                    {recentPatients.length > 0 ? (
                        <div className="patients-grid">
                            {recentPatients.map(patient => (
                                <PatientCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No patients found</p>
                    )}
                </div>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <h4>Recent Claims</h4>
                    <Link to="/insurance" className="view-all">View All →</Link>
                </div>
                <div className="section-content">
                    {recentClaims.length > 0 ? (
                        <div className="claims-grid">
                            {recentClaims.slice(0, 2).map(claim => (
                                <ClaimCard key={claim.id} claim={claim} showActions={false} />
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No claims found</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Doctor Dashboard
const DoctorDashboard = ({ user, stats, recentPatients }) => (
    <div className="role-dashboard doctor-dashboard">
        <div className="dashboard-header">
            <div>
                <h2 className="dashboard-title">Doctor Dashboard</h2>
                <p className="dashboard-subtitle">Manage your patients and prescriptions</p>
            </div>
            <span className="role-badge doctor">Doctor</span>
        </div>

        <div className="stats-grid three-col">
            <StatCard icon="👥" value={stats.totalPatients} label="My Patients" color="primary" />
            <StatCard icon="💊" value={stats.totalPrescriptions || 0} label="Prescriptions" color="success" />
            <StatCard icon="📝" value={stats.totalReports || 0} label="Reports" color="info" />
        </div>

        <div className="quick-actions">
            <h4>Doctor Actions</h4>
            <div className="action-buttons">
                <Link to="/doctor" className="action-btn primary">
                    <span className="action-icon">📝</span>
                    <span>New Prescription</span>
                </Link>
                <Link to="/doctor" className="action-btn">
                    <span className="action-icon">📄</span>
                    <span>Create Summary</span>
                </Link>
                <Link to="/patient" className="action-btn">
                    <span className="action-icon">🔍</span>
                    <span>View Patients</span>
                </Link>
            </div>
        </div>

        <div className="dashboard-sections">
            <div className="section-card full-width">
                <div className="section-header">
                    <h4>My Patients</h4>
                    <Link to="/doctor" className="view-all">View All →</Link>
                </div>
                <div className="section-content">
                    {recentPatients.length > 0 ? (
                        <div className="patients-grid">
                            {recentPatients.map(patient => (
                                <PatientCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No patients assigned</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Insurance Dashboard
const InsuranceDashboard = ({ user, stats, recentClaims }) => (
    <div className="role-dashboard insurance-dashboard">
        <div className="dashboard-header">
            <div>
                <h2 className="dashboard-title">Insurance Dashboard</h2>
                <p className="dashboard-subtitle">Process claims with AI-powered authorization</p>
            </div>
            <span className="role-badge insurance">Insurance</span>
        </div>

        <div className="stats-grid">
            <StatCard icon="📋" value={stats.totalClaims} label="Total Claims" color="primary" />
            <StatCard icon="✓" value={stats.approvedClaims} label="Approved" color="success" />
            <StatCard icon="⏳" value={stats.pendingClaims} label="Pending" color="warning" />
            <StatCard icon="💰" value={`$${stats.totalValue.toLocaleString()}`} label="Total Value" color="info" />
        </div>

        <div className="ai-highlight">
            <div className="ai-icon">🤖</div>
            <div className="ai-content">
                <h4>AI Prior Authorization</h4>
                <p>Our AI automatically analyzes claims based on patient history and treatment type. {stats.pendingClaims} claims need your review.</p>
            </div>
            <Link to="/insurance" className="btn btn-primary">Review Claims</Link>
        </div>

        <div className="quick-actions">
            <h4>Insurance Actions</h4>
            <div className="action-buttons">
                <Link to="/insurance" className="action-btn primary">
                    <span className="action-icon">🔍</span>
                    <span>Review Pending</span>
                </Link>
                <Link to="/insurance" className="action-btn">
                    <span className="action-icon">📊</span>
                    <span>View Analytics</span>
                </Link>
                <Link to="/insurance" className="action-btn">
                    <span className="action-icon">➕</span>
                    <span>New Claim</span>
                </Link>
            </div>
        </div>

        <div className="dashboard-sections">
            <div className="section-card full-width">
                <div className="section-header">
                    <h4>Claims Requiring Review</h4>
                    <Link to="/insurance" className="view-all">View All →</Link>
                </div>
                <div className="section-content">
                    {recentClaims.filter(c => c.status === 'pending').length > 0 ? (
                        <div className="claims-grid">
                            {recentClaims.filter(c => c.status === 'pending').slice(0, 3).map(claim => (
                                <ClaimCard key={claim.id} claim={claim} showActions={false} />
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No pending claims</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Default Dashboard
const DefaultDashboard = ({ stats }) => (
    <div className="role-dashboard">
        <div className="dashboard-header">
            <h2 className="dashboard-title">Dashboard</h2>
        </div>
        <div className="stats-grid">
            <StatCard icon="🏥" value={stats.totalPatients} label="Total Patients" color="primary" />
            <StatCard icon="📋" value={stats.totalClaims} label="Total Claims" color="success" />
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ icon, value, label, color }) => (
    <div className={`stat-card stat-${color}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-label">{label}</p>
        </div>
    </div>
);

export default Dashboard;
