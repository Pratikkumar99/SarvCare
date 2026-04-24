import React, { useEffect, useState } from 'react';
import { doctorAPI, patientAPI } from '../services/api';

const DoctorDashboard = ({ user }) => {
    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
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
        title: '',
        file: null
    });
    const [stats, setStats] = useState({
        prescriptions: 0,
        patientsSeen: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [patientsRes, prescriptionsRes] = await Promise.all([
                patientAPI.getAll(user?.id, user?.role),
                doctorAPI.getPrescriptions(user?.id || 2)
            ]);
            // Filter to show only doctor's treated patients
            const allPatients = patientsRes.data.patients || [];
            const myPatients = allPatients.filter(p => p.treated_by === user?.id);
            setPatients(myPatients);
            setPrescriptions(prescriptionsRes.data.prescriptions || []);
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
            // Update stats - increment prescriptions and patients seen
            setStats(prev => ({
                ...prev,
                prescriptions: (prev.prescriptions || 0) + 1,
                patientsSeen: (prev.patientsSeen || 0) + 1
            }));
            fetchData();
        } catch (err) {
            console.error('Error creating prescription:', err);
            alert('Error creating prescription. Please try again.');
        }
    };

    const handleSummarySubmit = async (e) => {
        e.preventDefault();
        try {
            await doctorAPI.createSummary(summaryData);
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
            const formData = new FormData();
            formData.append('patient_id', reportData.patient_id);
            formData.append('title', reportData.title);
            formData.append('file', reportData.file);
            formData.append('doctor_id', user?.id || 2);
            
            await doctorAPI.uploadReport(formData);
            setShowReportModal(false);
            setReportData({ patient_id: '', title: '', file: null });
            fetchData();
            alert('Report uploaded successfully!');
        } catch (err) {
            console.error('Error uploading report:', err);
            alert('Error uploading report. Please try again.');
        }
    };

    const viewPatientDetails = async (patientId) => {
        try {
            const response = await patientAPI.getById(patientId, user?.id, user?.role);
            setSelectedPatient(response.data.patient);
        } catch (err) {
            console.error('Error fetching patient details:', err);
        }
    };

    // Search patient by ABHA ID
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
                <h2 className="mb-0">Doctor Portal</h2>
                <div>
                    <button className="btn btn-success me-2" onClick={() => { if (selectedPatient) { setPrescriptionData({...prescriptionData, patient_id: selectedPatient.id}); } setShowPrescriptionModal(true); }}>
                        + New Prescription
                    </button>
                    <button className="btn btn-info" onClick={() => { if (selectedPatient) { setSummaryData({...summaryData, patient_id: selectedPatient.id}); } setShowSummaryModal(true); }}>
                        + Create Summary
                    </button>
                </div>
            </div>

            {/* ABHA ID Search */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Search Patient by ABHA ID</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={searchByAbhaId} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter ABHA ID (e.g., ABHA-1234-5678-9012)"
                            value={abhaSearchId}
                            onChange={(e) => setAbhaSearchId(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </form>
                    {searchResult && (
                        <div className="alert alert-success mt-3">
                            <strong>Patient Found:</strong> {searchResult.name} (ABHA: {searchResult.abha_id})
                            <button
                                className="btn btn-sm btn-success ms-3"
                                onClick={() => viewPatientDetails(searchResult.id)}
                            >
                                View Details
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                {/* Patients List */}
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">My Patients</h5>
                            <span className="badge bg-info">{patients.length} total</span>
                        </div>
                        <div className="card-body">
                            {patients.map(patient => (
                                <div key={patient.id} 
                                     className="d-flex justify-content-between align-items-center p-3 border-bottom hover-bg-light cursor-pointer"
                                     onClick={() => viewPatientDetails(patient.id)}>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 bg-success" 
                                             style={{ width: '40px', height: '40px' }}>
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h6 className="mb-0">{patient.name}</h6>
                                            <small className="text-muted">{patient.email}</small>
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-right text-muted"></i>
                                </div>
                            ))}
                            {patients.length === 0 && (
                                <p className="text-muted text-center py-3">No patients found</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Prescriptions */}
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Recent Prescriptions</h5>
                        </div>
                        <div className="card-body">
                            {prescriptions.map(prescription => (
                                <div key={prescription.id} className="p-3 border-bottom">
                                    <div className="d-flex justify-content-between">
                                        <h6 className="mb-1">{prescription.medication}</h6>
                                        <small className="text-muted">{new Date(prescription.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <p className="mb-1 text-muted">{prescription.dosage}</p>
                                    <small className="text-primary">Patient: {prescription.patient_name}</small>
                                </div>
                            ))}
                            {prescriptions.length === 0 && (
                                <p className="text-muted text-center py-3">No prescriptions yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient Details Panel */}
                <div className="col-md-4">
                    {selectedPatient ? (
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Patient Details</h5>
                            </div>
                            <div className="card-body">
                                <h4>{selectedPatient.name}</h4>
                                <p className="text-muted">{selectedPatient.email}</p>
                                {selectedPatient.abha_id && (
                                    <p><strong>ABHA ID:</strong> <span className="badge bg-info">{selectedPatient.abha_id}</span></p>
                                )}
                                <hr />
                                <p><strong>Age:</strong> {selectedPatient.age}</p>
                                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                                <p><strong>History:</strong> {selectedPatient.history}</p>
                                
                                {/* Action buttons */}
                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-primary" onClick={() => { setPrescriptionData({...prescriptionData, patient_id: selectedPatient?.id}); setShowPrescriptionModal(true); }}>
                                        <i className="fas fa-plus-circle me-2"></i>Create Prescription
                                    </button>
                                    <button className="btn btn-info" onClick={() => { setSummaryData({...summaryData, patient_id: selectedPatient?.id}); setShowSummaryModal(true); }}>
                                        <i className="fas fa-file-medical me-2"></i>Create Summary
                                    </button>
                                    <button className="btn btn-success" onClick={() => { setReportData({...reportData, patient_id: selectedPatient?.id}); setShowReportModal(true); }}>
                                        <i className="fas fa-upload me-2"></i>Upload Report
                                    </button>
                                </div>
                                
                                <hr />
                                
                                <h6 className="mt-4">Prescriptions</h6>
                                {selectedPatient.prescriptions?.length > 0 ? (
                                    selectedPatient.prescriptions.map(prescription => (
                                        <div key={prescription.id} className="p-2 bg-light rounded mb-2">
                                            <strong>{prescription.medication}</strong>
                                            <p className="mb-0 small">{prescription.dosage}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted small">No prescriptions yet</p>
                                )}

                                <h6 className="mt-4">Claims</h6>
                                {selectedPatient.claims?.length > 0 ? (
                                    selectedPatient.claims.map(claim => (
                                        <div key={claim.id} className="p-2 bg-light rounded mb-2">
                                            <span className={`badge bg-${claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'danger' : 'warning'}`}>
                                                {claim.status}
                                            </span>
                                            <span className="ms-2">{claim.treatment}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted small">No claims</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body text-center text-muted py-5">
                                <div className="display-4 mb-3">👨‍⚕️</div>
                                <p>Select a patient to view details or create a prescription</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Prescription Modal */}
            {showPrescriptionModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Prescription</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPrescriptionModal(false)}></button>
                            </div>
                            <form onSubmit={handlePrescriptionSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient</label>
                                        <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                                        <input type="hidden" value={prescriptionData.patient_id} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Medication</label>
                                        <input type="text" className="form-control" required value={prescriptionData.medication} onChange={(e) => setPrescriptionData({...prescriptionData, medication: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Dosage</label>
                                        <input type="text" className="form-control" placeholder="e.g., 500mg twice daily" value={prescriptionData.dosage} onChange={(e) => setPrescriptionData({...prescriptionData, dosage: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Notes</label>
                                        <textarea className="form-control" rows="3" value={prescriptionData.notes} onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPrescriptionModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Prescription</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Summary Modal */}
            {showSummaryModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Patient Summary</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSummaryModal(false)}></button>
                            </div>
                            <form onSubmit={handleSummarySubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient</label>
                                        <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                                        <input type="hidden" value={summaryData.patient_id} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Summary</label>
                                        <textarea className="form-control" rows="5" required placeholder="Enter patient summary report..." value={summaryData.summary_text} onChange={(e) => setSummaryData({...summaryData, summary_text: e.target.value})}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowSummaryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-info">Create Summary</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Report Modal */}
            {showReportModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Upload Report</h5>
                                <button type="button" className="btn-close" onClick={() => setShowReportModal(false)}></button>
                            </div>
                            <form onSubmit={handleReportSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient</label>
                                        <input type="text" className="form-control" value={selectedPatient?.name || ''} disabled />
                                        <input type="hidden" value={reportData.patient_id} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Report Title</label>
                                        <input type="text" className="form-control" required placeholder="Enter report title..." value={reportData.title} onChange={(e) => setReportData({...reportData, title: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Upload File</label>
                                        <input type="file" className="form-control" required onChange={(e) => setReportData({...reportData, file: e.target.files[0]})} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success">Upload Report</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
