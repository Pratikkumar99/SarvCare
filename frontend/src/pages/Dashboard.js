import React, { useEffect, useState } from 'react';
import { patientAPI, insuranceAPI } from '../services/api';
import PatientCard from '../components/PatientCard';
import ClaimCard from '../components/ClaimCard';

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
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Dashboard Overview</h2>
                <span className="text-muted">Welcome back, {user?.name}</span>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">Total Patients</h6>
                                    <h3 className="mb-0">{stats.totalPatients}</h3>
                                </div>
                                <div className="display-6">🏥</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">Total Claims</h6>
                                    <h3 className="mb-0">{stats.totalClaims}</h3>
                                </div>
                                <div className="display-6">📋</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1">Pending Claims</h6>
                                    <h3 className="mb-0">{stats.pendingClaims}</h3>
                                </div>
                                <div className="display-6">⏳</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-white-50 mb-1">Approved Claims</h6>
                                    <h3 className="mb-0">{stats.approvedClaims}</h3>
                                </div>
                                <div className="display-6">✓</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Patients */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Recent Patients</h4>
                    <a href="/patient" className="btn btn-sm btn-outline-primary">View All</a>
                </div>
                <div className="row g-4">
                    {recentPatients.map(patient => (
                        <div className="col-md-4" key={patient.id}>
                            <PatientCard patient={patient} />
                        </div>
                    ))}
                    {recentPatients.length === 0 && (
                        <div className="col-12">
                            <div className="text-center text-muted py-5">
                                <p>No patients found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Claims */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Recent Claims</h4>
                    <a href="/insurance" className="btn btn-sm btn-outline-primary">View All</a>
                </div>
                <div className="row g-4">
                    {recentClaims.map(claim => (
                        <div className="col-md-4" key={claim.id}>
                            <ClaimCard claim={claim} showActions={false} />
                        </div>
                    ))}
                    {recentClaims.length === 0 && (
                        <div className="col-12">
                            <div className="text-center text-muted py-5">
                                <p>No claims found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
