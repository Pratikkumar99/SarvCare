import React, { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';
import PatientCard from '../components/PatientCard';

const PatientDashboard = ({ user }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        gender: 'Male',
        history: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await patientAPI.getAll();
            setPatients(response.data.patients || []);
        } catch (err) {
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patientAPI.create(formData);
            setShowModal(false);
            setFormData({ name: '', email: '', age: '', gender: 'Male', history: '' });
            fetchPatients();
        } catch (err) {
            console.error('Error creating patient:', err);
            alert('Error creating patient. Please try again.');
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
                <h2 className="mb-0">Patient Records</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Patient
                </button>
            </div>

            <div className="row g-4">
                {patients.map(patient => (
                    <div className="col-md-6 col-lg-4" key={patient.id}>
                        <PatientCard patient={patient} />
                    </div>
                ))}
                {patients.length === 0 && (
                    <div className="col-12">
                        <div className="text-center text-muted py-5">
                            <div className="display-4 mb-3">🏥</div>
                            <h4>No patients found</h4>
                            <p>Add your first patient to get started.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Patient Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Patient</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Age</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                required
                                                value={formData.age}
                                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Gender</label>
                                            <select
                                                className="form-select"
                                                value={formData.gender}
                                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Medical History</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.history}
                                            onChange={(e) => setFormData({...formData, history: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Patient
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
