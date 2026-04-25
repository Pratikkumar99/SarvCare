import React from 'react';
import { Link } from 'react-router-dom';
import './PatientCard.css';

const PatientCard = ({ patient }) => {
    return (
        <div className="card-modern h-100">
            <div className="card-body">
                <div className="patient-avatar">
                    <div className="avatar-circle">
                        {patient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h5 className="patient-name">{patient.name}</h5>
                        <small className="patient-email">{patient.email}</small>
                    </div>
                </div>
                
                <div className="patient-details">
                    <div className="detail-item">
                        <span className="detail-label">Age</span>
                        <strong>{patient.age} years</strong>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <strong>{patient.gender}</strong>
                    </div>
                </div>

                <div className="medical-history">
                    <span className="history-label">Medical History</span>
                    <p className="history-text">
                        {patient.history || 'No history recorded'}
                    </p>
                </div>

                <Link 
                    to={`/summary/${patient.id}`} 
                    className="btn-view-summary"
                >
                    View Summary Report →
                </Link>
            </div>
                    </div>
    );
};

export default PatientCard;