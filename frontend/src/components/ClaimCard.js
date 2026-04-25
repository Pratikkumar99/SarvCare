import React from 'react';
import './ClaimCard.css';

const ClaimCard = ({ claim, onUpdateStatus, showActions = true }) => {
    const getStatusBadge = (status) => {
        const config = {
            approved: { class: 'status-badge-approved', icon: '✓', text: 'Approved' },
            rejected: { class: 'status-badge-rejected', icon: '✗', text: 'Rejected' },
            pending: { class: 'status-badge-pending', icon: '⏳', text: 'Pending' }
        };
        const { class: badgeClass, icon, text } = config[status] || config.pending;
        return { class: badgeClass, icon, text };
    };

    const getAIRecommendation = (recommendation) => {
        if (!recommendation) return null;
        try {
            const parsed = typeof recommendation === 'string' ? JSON.parse(recommendation) : recommendation;
            const config = {
                APPROVE: { class: 'ai-badge-approve', icon: '✓', text: 'AI Recommended Approve' },
                FLAG: { class: 'ai-badge-flag', icon: '⚠', text: 'AI Flagged for Review' }
            };
            return config[parsed.recommendation] || { class: 'ai-badge-pending', icon: '⏳', text: 'AI Analysis Pending' };
        } catch {
            return null;
        }
    };

    const statusBadge = getStatusBadge(claim.status);
    const aiBadge = getAIRecommendation(claim.ai_recommendation);

    return (
        <div className="card-modern h-100">
            <div className="card-body">
                <div className="claim-card-header">
                    <span className={`status-badge ${statusBadge.class}`}>
                        <span className="badge-icon">{statusBadge.icon}</span>
                        {statusBadge.text}
                    </span>
                    {aiBadge && (
                        <span className={`ai-badge ${aiBadge.class}`}>
                            <span className="badge-icon">{aiBadge.icon}</span>
                            {aiBadge.text}
                        </span>
                    )}
                </div>

                <h5 className="claim-title">{claim.treatment}</h5>
                <p className="claim-patient">{claim.patient_name}</p>
                
                <p className="claim-description">{claim.description}</p>

                <div className="claim-cost">
                    <span className="cost-label">Amount</span>
                    <span className="cost-value">₹{parseFloat(claim.cost || 0).toLocaleString('en-IN')}</span>
                </div>

                {claim.ai_recommendation && (
                    <div className="ai-analysis">
                        <span className="analysis-label">🤖 AI Analysis</span>
                        <p className="analysis-text">
                            {typeof claim.ai_recommendation === 'string' 
                                ? JSON.parse(claim.ai_recommendation).reason 
                                : claim.ai_recommendation.reason}
                        </p>
                    </div>
                )}

                {showActions && claim.status === 'pending' && (
                    <div className="claim-actions">
                        <button 
                            className="btn-approve"
                            onClick={() => onUpdateStatus(claim.id, 'approved')}
                        >
                            ✓ Approve Claim
                        </button>
                        <button 
                            className="btn-reject"
                            onClick={() => onUpdateStatus(claim.id, 'rejected')}
                        >
                            ✗ Reject Claim
                        </button>
                    </div>
                )}
            </div>
            <div className="card-footer bg-transparent">
                <small className="text-muted">
                    Submitted: {new Date(claim.created_at).toLocaleDateString()}
                </small>
            </div>
        </div>
    );
};

export default ClaimCard;