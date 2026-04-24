import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import SummaryCard from '../components/SummaryCard';

const SummaryPage = ({ user }) => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        }
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await patientAPI.getById(patientId, user?.id, user?.role);
            if (response.data.success) {
                setPatient(response.data.patient);
                setSummary(response.data.patient.summaries?.[0] || null);
            }
        } catch (err) {
            console.error('Error fetching patient data:', err);
            setError('Failed to load patient data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await patientAPI.getSummary(patientId, user?.id, user?.role);
            if (response.data.success) {
                setSummary(response.data.summary);
            }
        } catch (err) {
            console.error('Error fetching summary:', err);
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

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
                <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchPatientData}>
                    Retry
                </button>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="alert alert-warning" role="alert">
                Patient not found.
                <button className="btn btn-sm btn-outline-primary ms-3" onClick={() => navigate('/patient')}>
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h2 className="mb-0">Patient Summary Report</h2>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ Print Report
                </button>
            </div>

            {/* Summary Card */}
            <div className="mb-4">
                <SummaryCard 
                    summary={summary ? {
                        ...summary,
                        patient_name: patient.name,
                        age: patient.age,
                        gender: patient.gender,
                        history: patient.history
                    } : null} 
                />
            </div>

            {/* Additional Patient Details */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Prescriptions</h5>
                        </div>
                        <div className="card-body">
                            {patient.prescriptions?.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {patient.prescriptions.map(prescription => (
                                        <div key={prescription.id} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">{prescription.medication}</h6>
                                                    <p className="mb-1 text-muted">{prescription.dosage}</p>
                                                    {prescription.notes && (
                                                        <small className="text-muted">{prescription.notes}</small>
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(prescription.created_at).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <small className="text-primary">Prescribed by: {prescription.doctor_name}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted text-center py-4">No prescriptions recorded</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Claims History</h5>
                        </div>
                        <div className="card-body">
                            {patient.claims?.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {patient.claims.map(claim => (
                                        <div key={claim.id} className="list-group-item px-0">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">{claim.treatment}</h6>
                                                    <p className="mb-1 text-muted">{claim.description}</p>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge bg-${claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'danger' : 'warning'}`}>
                                                        {claim.status}
                                                    </span>
                                                    <p className="mb-0 mt-1"><strong>${claim.cost}</strong></p>
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                Submitted: {new Date(claim.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted text-center py-4">No claims history</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryPage;
