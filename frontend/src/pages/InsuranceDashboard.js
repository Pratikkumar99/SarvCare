import React, { useEffect, useState } from 'react';
import { insuranceAPI } from '../services/api';
import ClaimCard from '../components/ClaimCard';

const InsuranceDashboard = ({ user }) => {
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        treatment: '',
        description: '',
        cost: ''
    });
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let claimsRes;
            if (activeTab === 'all') {
                claimsRes = await insuranceAPI.getAllClaims();
            } else {
                claimsRes = await insuranceAPI.getClaimsByStatus(activeTab);
            }
            setClaims(claimsRes.data.claims || []);

            const statsRes = await insuranceAPI.getClaimStats();
            setStats(statsRes.data.stats || {});
        } catch (err) {
            console.error('Error fetching claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (claimId, status) => {
        try {
            await insuranceAPI.updateClaim(claimId, { status });
            fetchData();
        } catch (err) {
            console.error('Error updating claim:', err);
            alert('Error updating claim. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await insuranceAPI.createClaim(formData);
            setShowModal(false);
            setFormData({ patient_id: '', treatment: '', description: '', cost: '' });
            fetchData();
            
            // Show AI analysis result
            if (response.data.aiAnalysis) {
                alert(`AI Recommendation: ${response.data.aiAnalysis.recommendation}\nReason: ${response.data.aiAnalysis.reason}`);
            }
        } catch (err) {
            console.error('Error creating claim:', err);
            alert('Error creating claim. Please try again.');
        }
    };

    const getAIRecommendation = async (claimId) => {
        try {
            const response = await insuranceAPI.getAIAnalysis(claimId);
            const analysis = response.data.aiAnalysis;
            alert(`AI Analysis\nRecommendation: ${analysis.recommendation}\nConfidence: ${(analysis.confidence * 100).toFixed(0)}%\nReason: ${analysis.reason}`);
        } catch (err) {
            console.error('Error getting AI analysis:', err);
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
                <h2 className="mb-0">Insurance Claims Management</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Submit Claim
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body text-center">
                            <h4 className="text-primary mb-1">{stats.total}</h4>
                            <small className="text-muted">Total Claims</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body text-center">
                            <h4 className="text-success mb-1">{stats.approved}</h4>
                            <small className="text-muted">Approved</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <h4 className="text-warning mb-1">{stats.pending}</h4>
                            <small className="text-muted">Pending</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <h4 className="text-info mb-1">${parseFloat(stats.total_value || 0).toLocaleString()}</h4>
                            <small className="text-muted">Total Value</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                {['all', 'pending', 'approved', 'rejected'].map(tab => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'pending' && stats.pending > 0 && (
                                <span className="badge bg-danger ms-2">{stats.pending}</span>
                            )}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Claims Grid */}
            <div className="row g-4">
                {claims.map(claim => (
                    <div className="col-md-6 col-lg-4" key={claim.id}>
                        <ClaimCard 
                            claim={claim} 
                            onUpdateStatus={handleUpdateStatus}
                            showActions={true}
                        />
                        {claim.status === 'pending' && (
                            <button 
                                className="btn btn-sm btn-outline-info w-100 mt-2"
                                onClick={() => getAIRecommendation(claim.id)}
                            >
                                🤖 Get AI Analysis
                            </button>
                        )}
                    </div>
                ))}
                {claims.length === 0 && (
                    <div className="col-12">
                        <div className="text-center text-muted py-5">
                            <div className="display-4 mb-3">📋</div>
                            <h4>No claims found</h4>
                            <p>Submit a new claim to get started.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Claim Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Submit New Claim</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Patient ID</label>
                                        <input type="number" className="form-control" required value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} />
                                        <small className="text-muted">Enter patient ID (try 1 or 2 for demo)</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Treatment</label>
                                        <input type="text" className="form-control" required value={formData.treatment} onChange={(e) => setFormData({...formData, treatment: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Cost ($)</label>
                                        <input type="number" step="0.01" className="form-control" required value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
                                    </div>
                                    <div className="alert alert-info">
                                        <small>🤖 AI will automatically analyze this claim and provide a recommendation based on patient history and treatment type.</small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Submit Claim</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceDashboard;
