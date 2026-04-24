import React, { useEffect, useState, useCallback } from "react";
import { patientAPI, API_URL } from "../services/api";
import "../styles/Dashboard.css";

const PatientDashboard = ({ user }) => {
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    prescriptions: 0,
    claims: 0,
    summaries: 0,
  });

  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);

      const patientRes = await patientAPI.getAll(user?.id, user?.role);
      const patientData = patientRes.data.patients?.[0];
      setPatient(patientData);

      if (patientData) {
        const detailsRes = await patientAPI.getById(
          patientData.id,
          user?.id,
          user?.role,
        );
        if (detailsRes.data.success) {
          const prescriptionsData = detailsRes.data.patient.prescriptions || [];
          const claimsData = detailsRes.data.patient.claims || [];
          const summariesData = detailsRes.data.patient.summaries || [];

          setPrescriptions(prescriptionsData);
          setClaims(claimsData);
          setSummaries(summariesData);

          setStats({
            prescriptions: prescriptionsData.length,
            claims: claimsData.length,
            summaries: summariesData.length,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your medical records...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your medical records overview</p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-info">
              <h3>{stats.prescriptions}</h3>
              <p>Prescriptions</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-info">
              <h3>{stats.claims}</h3>
              <p>Insurance Claims</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-info">
              <h3>{stats.summaries}</h3>
              <p>Medical Summaries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">My Prescriptions ({prescriptions.length})</h2>
        </div>
        <div className="dashboard-section-body">
          {prescriptions.length === 0 ? (
            <div className="empty-state">
              <h3>No prescriptions found</h3>
              <p>No prescriptions have been recorded for you yet.</p>
            </div>
          ) : (
            <div className="prescription-grid">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-card">
                  <div className="prescription-header">
                    <span className="prescription-date">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </span>
                    <span className="prescription-doctor">Dr. {prescription.doctor_name}</span>
                  </div>
                  <div className="prescription-content">
                    <h4>{prescription.medication}</h4>
                    <p><strong>Dosage:</strong> {prescription.dosage || 'Not specified'}</p>
                    <p><strong>Instructions:</strong> {prescription.instructions || prescription.notes || 'No instructions provided'}</p>
                  </div>
                  <div className="prescription-actions">
                    <button className="action-btn">View Details</button>
                    <button className="action-btn">Refill</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insurance Claims Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Insurance Claims ({claims.length})</h2>
        </div>
        <div className="dashboard-section-body">
          {claims.length === 0 ? (
            <div className="empty-state">
              <h3>No insurance claims found</h3>
              <p>No insurance claims have been submitted yet.</p>
            </div>
          ) : (
            <div className="claim-grid">
              {claims.map((claim) => (
                <div key={claim.id} className="claim-card">
                  <div className="claim-header">
                    <span className="claim-id">#{claim.id}</span>
                    <span className={`claim-status status-${claim.status}`}>{claim.status}</span>
                    <span className="claim-date">{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="claim-content">
                    <h4>{claim.treatment || 'Medical Treatment'}</h4>
                    <p>{claim.description || 'No description available'}</p>
                    <p><strong>Amount:</strong> ${parseFloat(claim.cost || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medical Summaries Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Medical Summaries ({summaries.length})</h2>
        </div>
        <div className="dashboard-section-body">
          {summaries.length === 0 ? (
            <div className="empty-state">
              <h3>No medical summaries available</h3>
              <p>No medical summaries have been generated yet.</p>
            </div>
          ) : (
            <div className="summary-grid">
              {summaries.map((summary) => (
                <div key={summary.id} className="summary-card">
                  <div className="summary-header">
                    <span className="summary-date">{new Date(summary.created_at).toLocaleDateString()}</span>
                    <span className="summary-doctor">Dr. {summary.generated_by_name}</span>
                  </div>
                  <div className="summary-content">
                    <p>{summary.summary_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;