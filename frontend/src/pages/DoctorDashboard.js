import React, { useEffect, useState } from 'react';
import { doctorAPI, patientAPI } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import './DoctorDashboard.css';

const DoctorDashboard = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [abhaSearchId, setAbhaSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    notes: ''
  });
  const [summaryData, setSummaryData] = useState({
    patient_id: '',
    summary_text: ''
  });
  const [reportData, setReportData] = useState({
    patient_id: '',
    report_title: '',
    report_file: null
  });
  const [stats, setStats] = useState({
    prescriptions: 0,
    patientsSeen: 0,
    reports: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('DoctorDashboard fetchData - User ID:', user?.id);
      
      const [patientsRes, prescriptionsRes, reportsRes] = await Promise.all([
        doctorAPI.getPatients(user?.id || 2),
        doctorAPI.getPrescriptions(user?.id || 2),
        doctorAPI.getReports(user?.id || 2)
      ]);
      
      console.log('DoctorDashboard API Responses:');
      console.log('Patients response:', patientsRes);
      console.log('Prescriptions response:', prescriptionsRes);
      console.log('Reports response:', reportsRes);
      
      const myPatients = patientsRes.data.patients || [];
      console.log('My patients count:', myPatients.length);
      
      setPatients(myPatients);
      setPrescriptions(prescriptionsRes.data.prescriptions || []);
      setReports(reportsRes.data.reports || []);
      
      const newStats = {
        prescriptions: prescriptionsRes.data.prescriptions?.length || 0,
        patientsSeen: myPatients.length,
        reports: reportsRes.data.reports?.length || 0
      };
      
      console.log('Setting stats to:', newStats);
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createPrescription({
        ...prescriptionData,
        doctor_id: user?.id || 2
      });
      setShowPrescriptionModal(false);
      setPrescriptionData({ patient_id: '', medication: '', dosage: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating prescription:', err);
      alert('Error creating prescription. Please try again.');
    }
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createSummary({
        ...summaryData,
        generated_by: user?.id || 2
      });
      setShowSummaryModal(false);
      setSummaryData({ patient_id: '', summary_text: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating summary:', err);
      alert('Error creating summary. Please try again.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('=== REPORT SUBMISSION DEBUG ===');
      console.log('Report data before submit:', reportData);
      console.log('User data:', user);
      console.log('Selected patient:', selectedPatient);
      console.log('Event target:', e.target);
      
      // Check if the form exists and has the right fields
      const form = e.target;
      const domFormData = new FormData(form);
      console.log('Form data from DOM:');
      for (let [key, value] of domFormData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // Validate required fields
      if (!reportData.patient_id) {
        alert('Please select a patient first.');
        return;
      }
      
      if (!reportData.report_title || reportData.report_title.trim() === '') {
        alert('Please enter a report title.');
        return;
      }
      
      if (!reportData.report_file) {
        alert('Please select a file to upload.');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(reportData.report_file.type)) {
        alert('Invalid file type. Please upload an image, PDF, or document file.');
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (reportData.report_file.size > maxSize) {
        alert('File size too large. Please upload a file smaller than 10MB.');
        return;
      }
      
      const formData = new FormData();
      formData.append('patient_id', reportData.patient_id);
      formData.append('report_title', reportData.report_title.trim());
      formData.append('report_file', reportData.report_file);
      formData.append('doctor_id', user?.id || 2);
      formData.append('uploaded_by_name', user?.name || 'Doctor');
      
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await doctorAPI.uploadReport(formData);
      console.log('Upload response:', response);
      
      setShowReportModal(false);
      setReportData({ patient_id: '', report_title: '', report_file: null });
      fetchData();
      alert('Report uploaded successfully!');
    } catch (err) {
      console.error('Error uploading report:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error uploading report. Please try again.';
      alert(errorMessage);
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await patientAPI.getById(patientId, user?.id, user?.role);
      if (response && response.data && response.data.patient) {
        setSelectedPatient(response.data.patient);
      } else {
        alert('Error loading patient details.');
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      alert('Error loading patient details. Please try again.');
    }
  };

  const searchByAbhaId = async (e) => {
    e.preventDefault();
    if (!abhaSearchId.trim()) return;
    try {
      const response = await patientAPI.searchByAbhaId(abhaSearchId, user?.id, user?.role);
      if (response.data.success) {
        setSearchResult(response.data.patient);
        setSelectedPatient(response.data.patient);
      }
    } catch (err) {
      console.error('Error searching by ABHA ID:', err);
      alert('Patient not found with this ABHA ID');
      setSearchResult(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading doctor dashboard...</p>
      </div>
    );
  }

  const statsCards = (
    <>
      <div className="stat-card primary">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.patientsSeen}</h3>
            <p>Patients Seen</p>
          </div>
        </div>
      </div>
      <div className="stat-card success">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.prescriptions}</h3>
            <p>Prescriptions Written</p>
          </div>
        </div>
      </div>
      <div className="stat-card info">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.reports}</h3>
            <p>Reports Uploaded</p>
          </div>
        </div>
      </div>
    </>
  );

  const actions = (
    <>
      <button
        className="btn-primary"
        onClick={() => {
          if (selectedPatient) {
            setPrescriptionData({ ...prescriptionData, patient_id: selectedPatient.id });
          }
          setShowPrescriptionModal(true);
        }}
        disabled={!selectedPatient}
      >
        New Prescription
      </button>
      <button
        className="btn-secondary"
        onClick={() => {
          if (selectedPatient) {
            setSummaryData({ ...summaryData, patient_id: selectedPatient.id });
          }
          setShowSummaryModal(true);
        }}
        disabled={!selectedPatient}
      >
        Create Summary
      </button>
      <button
        className="btn-secondary"
        onClick={() => {
          if (selectedPatient) {
            setReportData({ ...reportData, patient_id: selectedPatient.id });
          }
          setShowReportModal(true);
        }}
        disabled={!selectedPatient}
      >
        Upload Report
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Doctor Portal"
      subtitle="Manage your patients and prescriptions"
      actions={actions}
      stats={statsCards}
    >
      {/* ABHA Search Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">Search Patient by ABHA ID</h3>
        </div>
        <div className="dashboard-section-body">
          <form onSubmit={searchByAbhaId} className="search-form">
            <input
              type="text"
              className="form-control"
              placeholder="Enter ABHA ID (e.g., ABHA-1234-5678-9012)"
              value={abhaSearchId}
              onChange={(e) => setAbhaSearchId(e.target.value)}
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          {searchResult && (
            <div className="alert alert-success">
              <strong>Patient Found:</strong> {searchResult.name} (ABHA: {searchResult.abha_id})
              <button
                className="btn-sm btn-primary"
                onClick={() => viewPatientDetails(searchResult.id)}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-two-columns">
        {/* Left Column - Scrollable */}
        <div className="dashboard-column left-column">
          {/* Patients List */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">My Patients</h3>
              <span className="badge-info">{patients.length} total</span>
            </div>
            <div className="dashboard-section-body">
              {patients.length === 0 ? (
                <div className="empty-state">
                  <p>No patients assigned yet.</p>
                </div>
              ) : (
                <div className="patient-list">
                  {patients.map(patient => (
                    <div
                      key={patient.id}
                      className={`patient-list-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                      onClick={() => viewPatientDetails(patient.id)}
                    >
                      <div className="patient-avatar-small">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="patient-info">
                        <h4>{patient.name}</h4>
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Recent Prescriptions</h3>
            </div>
            <div className="dashboard-section-body">
              {prescriptions.length === 0 ? (
                <div className="empty-state">
                  <p>No prescriptions written yet.</p>
                </div>
              ) : (
                <div className="prescription-list">
                  {prescriptions.slice(0, 5).map(prescription => (
                    <div key={prescription.id} className="prescription-list-item">
                      <div className="prescription-item-header">
                        <strong>{prescription.medication}</strong>
                        <span className="date">{new Date(prescription.created_at).toLocaleDateString()}</span>
                      </div>
                      <p>{prescription.dosage}</p>
                      <small>Patient: {prescription.patient_name}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sticky */}
        <div className="dashboard-column right-column">
          {selectedPatient ? (
            <div className="dashboard-section sticky-section">
              <div className="dashboard-section-header">
                <h3 className="dashboard-section-title">Patient Details</h3>
              </div>
              <div className="dashboard-section-body">
                <div className="patient-detail-header">
                  <div className="patient-detail-avatar">
                    {selectedPatient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{selectedPatient.name}</h2>
                    <p>{selectedPatient.email}</p>
                    {selectedPatient.abha_id && (
                      <span className="badge-info">ABHA: {selectedPatient.abha_id}</span>
                    )}
                  </div>
                </div>
                <div className="patient-detail-info">
                  <div><strong>Age:</strong> {selectedPatient.age}</div>
                  <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                  <div><strong>Medical History:</strong> {selectedPatient.history || 'None'}</div>
                </div>

                <div className="patient-detail-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setPrescriptionData({ ...prescriptionData, patient_id: selectedPatient.id });
                      setShowPrescriptionModal(true);
                    }}
                  >
                    Create Prescription
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSummaryData({ ...summaryData, patient_id: selectedPatient.id });
                      setShowSummaryModal(true);
                    }}
                  >
                    Create Summary
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setReportData({ ...reportData, patient_id: selectedPatient.id });
                      setShowReportModal(true);
                    }}
                  >
                    Upload Report
                  </button>
                </div>

                <div className="patient-detail-section">
                  <h4>Prescriptions</h4>
                  {selectedPatient.prescriptions?.length > 0 ? (
                    selectedPatient.prescriptions.map(p => (
                      <div key={p.id} className="prescription-item">
                        <strong>{p.medication}</strong> - {p.dosage}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No prescriptions yet</p>
                  )}
                </div>

                <div className="patient-detail-section">
                  <h4>Claims</h4>
                  {selectedPatient.claims?.length > 0 ? (
                    selectedPatient.claims.map(c => (
                      <div key={c.id} className={`claim-item status-${c.status}`}>
                        <span className="claim-status-badge">{c.status}</span>
                        <span>{c.treatment}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No claims yet</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-section">
              <div className="dashboard-section-body empty-state">
                <p>Select a patient to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals – keep as is */}
      {showPrescriptionModal && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Prescription</h3>
              <button className="modal-close" onClick={() => setShowPrescriptionModal(false)}>×</button>
            </div>
            <form onSubmit={handlePrescriptionSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient</label>
                  <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Medication</label>
                  <input type="text" className="form-control" required value={prescriptionData.medication} onChange={(e) => setPrescriptionData({...prescriptionData, medication: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input type="text" className="form-control" placeholder="e.g., 500mg twice daily" value={prescriptionData.dosage} onChange={(e) => setPrescriptionData({...prescriptionData, dosage: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea className="form-control" rows="3" value={prescriptionData.notes} onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPrescriptionModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Summary</h3>
              <button className="modal-close" onClick={() => setShowSummaryModal(false)}>×</button>
            </div>
            <form onSubmit={handleSummarySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient</label>
                  <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Summary</label>
                  <textarea className="form-control" rows="5" required value={summaryData.summary_text} onChange={(e) => setSummaryData({...summaryData, summary_text: e.target.value})} placeholder="Enter patient summary..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSummaryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Summary</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Report</h3>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient</label>
                  <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Report Title</label>
                  <input type="text" className="form-control" required value={reportData.report_title} onChange={(e) => setReportData({...reportData, report_title: e.target.value})} placeholder="Enter report title..." />
                </div>
                <div className="form-group">
                  <label>Report File</label>
                  <input type="file" className="form-control" required onChange={(e) => setReportData({...reportData, report_file: e.target.files[0]})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Upload Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;