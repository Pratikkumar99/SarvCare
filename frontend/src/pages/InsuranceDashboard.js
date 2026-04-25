import React, { useEffect, useState } from 'react';
import { insuranceAPI } from '../services/api';
import ClaimCard from '../components/ClaimCard';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Dashboard.css';

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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let claimsRes;
      if (activeTab === 'all') {
        claimsRes = await insuranceAPI.getAllClaims(user?.id, user?.role);
      } else {
        claimsRes = await insuranceAPI.getClaimsByStatus(activeTab, user?.id, user?.role);
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

  const statsCards = (
    <>
      <div className="stat-card primary">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.total || 0}</h3>
            <p>Total Claims</p>
          </div>
        </div>
      </div>
      <div className="stat-card success">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.approved || 0}</h3>
            <p>Approved</p>
          </div>
        </div>
      </div>
      <div className="stat-card warning">
        <div className="stat-content">
          <div className="stat-info">
            <h3>{stats.pending || 0}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>
      <div className="stat-card info">
        <div className="stat-content">
          <div className="stat-info">
            <h3>₹{parseFloat(stats.total_value || 0).toLocaleString('en-IN')}</h3>
            <p>Total Value</p>
          </div>
        </div>
      </div>
    </>
  );

  const actions = (
    <button className="btn-primary" onClick={() => setShowModal(true)}>
      + Submit Claim
    </button>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading claims...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Insurance Claims Management"
      subtitle="Process claims with AI-powered authorization"
      actions={actions}
      stats={statsCards}
    >
      {/* Tabs */}
      <div className="insurance-tabs">
        {['all', 'pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && stats.pending > 0 && (
              <span className="tab-badge">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Claims Grid */}
      {claims.length === 0 ? (
        <div className="empty-state">
          <h3>No claims found</h3>
          <p>Submit a new claim to get started.</p>
        </div>
      ) : (
        <div className="claim-grid">
          {claims.map(claim => (
            <div key={claim.id} className="claim-card-wrapper">
              <ClaimCard
                claim={claim}
                onUpdateStatus={handleUpdateStatus}
                showActions={true}
              />
              {claim.status === 'pending' && (
                <button
                  className="btn-secondary btn-sm ai-analysis-btn"
                  onClick={() => getAIRecommendation(claim.id)}
                >
                  Get AI Analysis
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Claim Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit New Claim</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient ID</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  />
                  <small className="form-hint">Enter patient ID (try 1 or 2 for demo)</small>
                </div>
                <div className="form-group">
                  <label>Treatment</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
                <div className="alert-info">
                  <small>🤖 AI will automatically analyze this claim based on patient history and treatment type.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InsuranceDashboard;