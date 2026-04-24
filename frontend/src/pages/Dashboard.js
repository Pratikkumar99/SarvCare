import React, { useEffect, useState } from 'react';
import { patientAPI, insuranceAPI } from '../services/api';
import PatientCard from '../components/PatientCard';
import ClaimCard from '../components/ClaimCard';
import SkeletonCard from '../components/SkeletonCard';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0
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
            
            // Fetch patients
            const patientsRes = await patientAPI.getAll();
            const patients = patientsRes.data.patients || [];
            
            // Fetch claims
            const claimsRes = await insuranceAPI.getAllClaims();
            const claims = claimsRes.data.claims || [];
            
            // Calculate stats
            const pendingClaims = claims.filter(c => c.status === 'pending').length;
            const approvedClaims = claims.filter(c => c.status === 'approved').length;
            
            setStats({
                totalPatients: patients.length,
                totalClaims: claims.length,
                pendingClaims,
                approvedClaims
            });
            
            setRecentPatients(patients.slice(0, 3));
            setRecentClaims(claims.slice(0, 3));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
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
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1>Welcome back, {user?.name}!</h1>
                    <p>Here's your healthcare management overview</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-gradient">Generate Report</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            <h3>{stats.totalPatients}</h3>
                            <p>Total Patients</p>
                        </div>
                        <div className="stat-icon">👥</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-content">
                        <div className="stat-info">
                            <h3>{stats.totalClaims}</h3>
                            <p>Total Claims</p>
                        </div>
                        <div className="stat-icon">📋</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-content">
                        <div className="stat-info">
                            <h3>{stats.pendingClaims}</h3>
                            <p>Pending Claims</p>
                        </div>
                        <div className="stat-icon">⏳</div>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-content">
                        <div className="stat-info">
                            <h3>{stats.approvedClaims}</h3>
                            <p>Approved Claims</p>
                        </div>
                        <div className="stat-icon">✓</div>
                    </div>
                </div>
            </div>

            {/* Recent Patients */}
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Recent Patients</h3>
                </div>
                <div className="dashboard-section-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {recentPatients.map(patient => (
                                <div className="col-md-4" key={patient.id}>
                                    <PatientCard patient={patient} />
                                </div>
                            ))}
                            {recentPatients.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">👥</div>
                                    <h3>No patients found</h3>
                                    <p>No patients have been added to the system yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Claims */}
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3 className="dashboard-section-title">Recent Claims</h3>
                </div>
                <div className="dashboard-section-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {recentClaims.map(claim => (
                                <div className="col-md-4" key={claim.id}>
                                    <ClaimCard claim={claim} />
                                </div>
                            ))}
                            {recentClaims.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <h3>No claims found</h3>
                                    <p>No insurance claims have been submitted yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
