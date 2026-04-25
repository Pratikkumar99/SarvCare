import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI, insuranceAPI, doctorAPI } from '../../services/api';
import PatientCard from '../../components/PatientCard';
import ClaimCard from '../../components/ClaimCard';
import DashboardLayout from '../../components/DashboardLayout';
import './Dashboard.css';

// Import the actual page components (from their own files)
import InsuranceDashboard from '../InsuranceDashboard';
import PatientDashboard from '../PatientDashboard';
import DoctorDashboard from '../DoctorDashboard';
// AdminDashboard can stay inline or be imported – we'll keep it here for simplicity

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalValue: 0,
    totalPrescriptions: 0,
    totalReports: 0
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

      setStats({
        totalPatients: patients.length,
        totalClaims: claims.length,
        pendingClaims,
        approvedClaims,
        totalValue,
        totalPrescriptions: prescriptions.length,
        totalReports: reports.length
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
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Role‑based rendering – delegates to the actual page components
  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard stats={stats} recentPatients={recentPatients} recentClaims={recentClaims} />;
      case 'doctor':
        return <DoctorDashboard user={user} />;
      case 'insurance':
        return <InsuranceDashboard user={user} />;
      case 'patient':
        return <PatientDashboard user={user} />;
      default:
        return <DefaultDashboard stats={stats} />;
    }
  };

  return <div className="dashboard-container">{renderRoleDashboard()}</div>;
};

// Admin Dashboard (kept inline for brevity – but uses real links to pages)
const AdminDashboard = ({ stats, recentPatients, recentClaims }) => (
  <DashboardLayout
    title="Admin Dashboard"
    subtitle="System overview and management"
    actions={<span className="role-badge admin">Administrator</span>}
    stats={
      <>
        <StatCard value={stats.totalPatients} label="Total Patients" color="primary" />
        <StatCard value={stats.totalClaims} label="Total Claims" color="success" />
        <StatCard value={stats.pendingClaims} label="Pending Review" color="warning" />
        <StatCard value={`$${stats.totalValue.toLocaleString()}`} label="Total Value" color="info" />
      </>
    }
  >
    <div className="quick-actions">
      <h4>Quick Actions</h4>
      <div className="action-buttons">
        <Link to="/patient" className="action-btn">Manage Patients</Link>
        <Link to="/doctor" className="action-btn">Doctor Portal</Link>
        <Link to="/insurance" className="action-btn">Review Claims</Link>
        <Link to="/admin" className="action-btn">System Settings</Link>
      </div>
    </div>
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
  </DashboardLayout>
);

// Default dashboard fallback
const DefaultDashboard = ({ stats }) => (
  <DashboardLayout
    title="Dashboard"
    subtitle="Welcome to SarvCare"
    stats={
      <>
        <StatCard value={stats.totalPatients} label="Total Patients" color="primary" />
        <StatCard value={stats.totalClaims} label="Total Claims" color="success" />
      </>
    }
  />
);

// Stat Card Component
const StatCard = ({ value, label, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

export default Dashboard;