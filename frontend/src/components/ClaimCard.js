import React from 'react';

const ClaimCard = ({ claim, onUpdateStatus, showActions = true }) => {
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            default: return 'bg-warning text-dark';
        }
    };

    const getAIRecommendationBadge = (recommendation) => {
        if (!recommendation) return null;
        try {
            const parsed = typeof recommendation === 'string' ? JSON.parse(recommendation) : recommendation;
            switch (parsed.recommendation) {
                case 'APPROVE': return { color: 'bg-success', icon: '✓', text: 'AI: Approve' };
                case 'FLAG': return { color: 'bg-warning text-dark', icon: '⚠', text: 'AI: Flag' };
                default: return { color: 'bg-secondary', icon: '⏳', text: 'AI: Pending' };
            }
        } catch {
            return null;
        }
    };

    const aiBadge = getAIRecommendationBadge(claim.ai_recommendation);

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${getStatusBadgeColor(claim.status)}`}>
                        {claim.status?.toUpperCase()}
                    </span>
                    {aiBadge && (
                        <span className={`badge ${aiBadge.color}`}>
                            {aiBadge.icon} {aiBadge.text}
                        </span>
                    )}
                </div>
            </div>
            <div className="card-body">
                <h5 className="card-title">{claim.treatment}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{claim.patient_name}</h6>
                
                <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>
                    {claim.description}
                </p>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Cost:</span>
                    <span className="h5 mb-0 text-primary">${claim.cost}</span>
                </div>

                {claim.ai_recommendation && (
                    <div className="alert alert-light border mb-3">
                        <small className="text-muted d-block mb-1">AI Analysis:</small>
                        <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                            {typeof claim.ai_recommendation === 'string' 
                                ? JSON.parse(claim.ai_recommendation).reason 
                                : claim.ai_recommendation.reason}
                        </p>
                    </div>
                )}

                {showActions && claim.status === 'pending' && (
                    <div className="d-grid gap-2">
                        <button 
                            className="btn btn-success btn-sm"
                            onClick={() => onUpdateStatus(claim.id, 'approved')}
                        >
                            ✓ Approve
                        </button>
                        <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => onUpdateStatus(claim.id, 'rejected')}
                        >
                            ✗ Reject
                        </button>
                    </div>
                )}
            </div>
            <div className="card-footer bg-light">
                <small className="text-muted">
                    Submitted: {new Date(claim.created_at).toLocaleDateString()}
                </small>
            </div>
        </div>
    );
};

export default ClaimCard;
