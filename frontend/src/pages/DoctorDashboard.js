import React, { useEffect, useState } from 'react';
import { doctorAPI, patientAPI } from '../services/api';

const DoctorDashboard = ({ user }) => {
    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [patientsRes, prescriptionsRes] = await Promise.all([
                doctorAPI.getPatients(),
                doctorAPI.getPrescriptions(user?.id || 2)
            ]);
            setPatients(patientsRes.data.patients || []);
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
            alert('Summary created successfully!');
        } catch (err) {
            console.error('Error creating summary:', err);
            alert('Error creating summary. Please try again.');
        }
    };

    const viewPatientDetails = async (patientId) => {
        try {
            const response = await patientAPI.getById(patientId);
            setSelectedPatient(response.data.patient);
        } catch (err) {
            console.error('Error fetching patient details:', err);
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
                    <button className="btn btn-success me-2" onClick={() => setShowPrescriptionModal(true)}>
                        + New Prescription
                    </button>
                    <button className="btn btn-info" onClick={() => setShowSummaryModal(true)}>
                        + Create Summary
                    </button>
                </div>
            </div>

            <div className="row">
                {/* Patients List */}
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">My Patients</h5>
                        </div>
                        <div className="card-body">
                            {patients.map(patient => (
                                <div key={patient.id} className="d-flex justify-content-between align-items-center p-3 border-bottom hover-bg-light cursor-pointer" onClick={() => viewPatientDetails(patient.id)}>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                            {patient.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="mb-0">{patient.name}</h6>
                                            <small className="text-muted">{patient.age} years • {patient.gender}</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                </div>
                            ))}
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
                                <hr />
                                <p><strong>Age:</strong> {selectedPatient.age}</p>
                                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                                <p><strong>History:</strong> {selectedPatient.history}</p>
                                
                                <h6 className="mt-4">Prescriptions</h6>
                                {selectedPatient.prescriptions?.map(prescription => (
                                    <div key={prescription.id} className="p-2 bg-light rounded mb-2">
                                        <strong>{prescription.medication}</strong>
                                        <p className="mb-0 small">{prescription.dosage}</p>
                                    </div>
                                ))}

                                <h6 className="mt-4">Claims</h6>
                                {selectedPatient.claims?.map(claim => (
                                    <div key={claim.id} className="p-2 bg-light rounded mb-2">
                                        <span className={`badge bg-${claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'danger' : 'warning'}`}>
                                            {claim.status}
                                        </span>
                                        <span className="ms-2">{claim.treatment}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body text-center text-muted py-5">
                                <div className="display-4 mb-3">👨‍⚕️</div>
                                <p>Select a patient to view details</p>
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
                                        <select className="form-select" required value={prescriptionData.patient_id} onChange={(e) => setPrescriptionData({...prescriptionData, patient_id: e.target.value})}>
                                            <option value="">Select Patient</option>
                                            {patients.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                        </select>
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
                                        <select className="form-select" required value={summaryData.patient_id} onChange={(e) => setSummaryData({...summaryData, patient_id: e.target.value})}>
                                            <option value="">Select Patient</option>
                                            {patients.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                        </select>
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
        </div>
    );
};

export default DoctorDashboard;
