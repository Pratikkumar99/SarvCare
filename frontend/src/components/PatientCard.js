import React from 'react';
import { Link } from 'react-router-dom';

const PatientCard = ({ patient }) => {
    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                    <div 
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: '50px', height: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                        {patient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h5 className="card-title mb-0">{patient.name}</h5>
                        <small className="text-muted">{patient.email}</small>
                    </div>
                </div>
                
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div className="p-2 bg-light rounded">
                            <small className="text-muted d-block">Age</small>
                            <strong>{patient.age} years</strong>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-2 bg-light rounded">
                            <small className="text-muted d-block">Gender</small>
                            <strong>{patient.gender}</strong>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <small className="text-muted d-block mb-1">Medical History</small>
                    <p className="card-text text-truncate-3" style={{ fontSize: '0.9rem' }}>
                        {patient.history || 'No history recorded'}
                    </p>
                </div>

                <Link 
                    to={`/summary/${patient.id}`} 
                    className="btn btn-outline-primary btn-sm w-100"
                >
                    View Summary Report
                </Link>
            </div>
            <div className="card-footer bg-transparent border-0">
                <small className="text-muted">
                    Patient ID: #{patient.id}
                </small>
            </div>
        </div>
    );
};

export default PatientCard;
