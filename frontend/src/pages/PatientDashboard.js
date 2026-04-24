import React, { useEffect, useState, useCallback } from "react";
import { patientAPI, API_URL } from "../services/api";
import "./PatientDashboard.css";

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

      // Get patient's own record
      const patientRes = await patientAPI.getAll(user?.id, user?.role);
      console.log(' API Response:', patientRes.data);
      const patientData = patientRes.data.patients[0];
      console.log(' Patient Data:', patientData);
      setPatient(patientData);

      if (patientData) {
        // Get full patient details including prescriptions, claims, summaries
        const detailsRes = await patientAPI.getById(
          patientData.id,
          user?.id,
          user?.role,
        );
        if (detailsRes.data.success) {
          setPrescriptions(detailsRes.data.patient.prescriptions || []);
          setClaims(detailsRes.data.patient.claims || []);
          setSummaries(detailsRes.data.patient.summaries || []);

          setStats({
            prescriptions: detailsRes.data.patient.prescriptions?.length || 0,
            claims: detailsRes.data.patient.claims?.length || 0,
            summaries: detailsRes.data.patient.summaries?.length || 0,
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
      <div className=" dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your medical records...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>My Medical Records</h1>
        <p className="welcome-text">Welcome , {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fas fa-prescription-bottle-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.prescriptions}</h3>
            <p>Prescriptions</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-file-medical-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.claims}</h3>
            <p>Insurance Claims</p>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.summaries}</h3>
            <p>Medical Summaries</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Personal Information */}
        {patient && (
          <div className="dashboard-card">
            <h2>
              <i className="fas fa-user-circle"></i> Personal Information
            </h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{patient.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{patient.email}</span>
              </div>
              <div className="info-item">
                <label>Age:</label>
                <span>{user?.age || patient.age} years</span>
              </div>
              <div className="info-item">
                <label>Gender:</label>
                <span>{patient.gender}</span>
              </div>
              <div className="info-item full-width">
                <label>Medical History:</label>
                <span>{patient.history || "No medical history recorded"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions */}
        <div className="dashboard-card">
          <h2>
            <i className="fas fa-prescription"></i> My Prescriptions
          </h2>
          {prescriptions.length > 0 ? (
            <div className="prescriptions-list">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="prescription-item">
                  <div className="prescription-header">
                    <h4>{prescription.medication}</h4>
                    <span className="date">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p>
                    <strong>Prescribed by:</strong> {prescription.doctor_name}
                  </p>
                  <p>
                    <strong>Dosage:</strong> {prescription.dosage}
                  </p>
                  <p>
                    <strong>Instructions:</strong> {prescription.instructions}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No prescriptions found.</p>
          )}
        </div>

        {/* Claims */}
        <div className="dashboard-card">
          <h2>
            <i className="fas fa-clipboard-check"></i> My Insurance Claims
          </h2>
          {claims.length > 0 ? (
            <div className="claims-list">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className={"claim-item status-" + claim.status.toLowerCase()}
                >
                  <div className="claim-header">
                    <h4>{claim.treatment}</h4>
                    <span
                      className={"status-badge " + claim.status.toLowerCase()}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <p>
                    <strong>Cost:</strong> ₹{claim.cost}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No claims found.</p>
          )}
        </div>

        {/* Medical Summaries */}
        <div className="dashboard-card">
          <h2>
            <i className="fas fa-file-medical"></i> Medical Summaries
          </h2>
          {summaries.length > 0 ? (
            <div className="summaries-list">
              {summaries.map((summary) => (
                <div key={summary.id} className="summary-item">
                  <p className="summary-text">{summary.summary_text}</p>
                  <p className="generated-by">
                    Generated by: {summary.generated_by_name} on{" "}
                    {new Date(summary.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No summaries available.</p>
          )}
        </div>

        {/* Reports */}
        <div className="dashboard-card">
          <h2>
            <i className="fas fa-file-pdf"></i> My Reports
          </h2>
          {patient?.reports?.length > 0 ? (
            <div className="reports-list">
              {patient.reports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-header">
                    <h4>{report.title}</h4>
                    <a
                      href={`${API_URL}/reports/download/${report.id}`}
                      className="btn btn-sm btn-primary"
                      download
                    >
                      <i className="fas fa-download me-1"></i>Download
                    </a>
                  </div>
                  <p className="text-muted small">
                    Uploaded by: {report.doctor_name} on{" "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
