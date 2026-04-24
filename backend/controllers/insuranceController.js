const pool = require('../models/db');

// Mock AI logic for claim approval
const mockAILogic = (treatment, description, cost, patientHistory) => {
    const history = patientHistory ? patientHistory.toLowerCase() : '';
    const treatmentLower = treatment.toLowerCase();
    const descLower = description ? description.toLowerCase() : '';
    
    // Rule-based AI logic
    const chronicConditions = ['diabetes', 'hypertension', 'asthma', 'heart disease', 'cholesterol'];
    const isChronicRelated = chronicConditions.some(condition => 
        history.includes(condition) && (treatmentLower.includes(condition) || descLower.includes(condition))
    );
    
    const preventiveCare = ['checkup', 'monitoring', 'consultation', 'screening', 'test'];
    const isPreventive = preventiveCare.some(care => 
        treatmentLower.includes(care) || descLower.includes(care)
    );
    
    const highCostKeywords = ['surgery', 'transplant', 'experimental', 'mri', 'ct scan', 'rehabilitation'];
    const isHighCost = highCostKeywords.some(keyword => 
        treatmentLower.includes(keyword) || descLower.includes(keyword)
    );
    
    if (isChronicRelated && isPreventive) {
        return { 
            recommendation: 'APPROVE', 
            confidence: 0.92, 
            reason: 'AI Analysis: Routine care for chronic condition. History matches treatment. Low risk.' 
        };
    } else if (isHighCost && !isChronicRelated) {
        return { 
            recommendation: 'FLAG', 
            confidence: 0.78, 
            reason: 'AI Analysis: High-cost procedure without chronic condition history. Requires manual review.' 
        };
    } else if (isPreventive && cost < 500) {
        return { 
            recommendation: 'APPROVE', 
            confidence: 0.88, 
            reason: 'AI Analysis: Low-cost preventive care. Standard protocol recommends approval.' 
        };
    } else if (cost > 1000) {
        return { 
            recommendation: 'FLAG', 
            confidence: 0.72, 
            reason: 'AI Analysis: High cost treatment. Additional verification recommended.' 
        };
    } else {
        return { 
            recommendation: 'PENDING', 
            confidence: 0.65, 
            reason: 'AI Analysis: Insufficient data for auto-approval. Requires manual review.' 
        };
    }
};

const insuranceController = {
    // Get all claims (filtered by user role)
    getAllClaims: async (req, res) => {
        try {
            const { userId, userRole } = req.query;
            
            let query;
            let params = [];
            
            if (userRole === 'patient' && userId) {
                // Patients only see their own claims
                query = `
                    SELECT c.*, u.name as patient_name, p.history as patient_history
                    FROM claims c
                    JOIN patients p ON c.patient_id = p.id
                    JOIN users u ON p.user_id = u.id
                    WHERE p.user_id = $1
                    ORDER BY c.created_at DESC
                `;
                params = [userId];
            } else {
                // Insurance, Admin, Doctor see all claims
                query = `
                    SELECT c.*, u.name as patient_name, p.history as patient_history
                    FROM claims c
                    JOIN patients p ON c.patient_id = p.id
                    JOIN users u ON p.user_id = u.id
                    ORDER BY c.created_at DESC
                `;
            }
            
            const result = await pool.query(query, params);
            res.json({ success: true, claims: result.rows });
        } catch (err) {
            console.error('Error fetching claims:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get claims by status (filtered by user role)
    getClaimsByStatus: async (req, res) => {
        try {
            const { status } = req.params;
            const { userId, userRole } = req.query;
            
            let query;
            let params = [status];
            
            if (userRole === 'patient' && userId) {
                // Patients only see their own claims by status
                query = `
                    SELECT c.*, u.name as patient_name, p.history as patient_history
                    FROM claims c
                    JOIN patients p ON c.patient_id = p.id
                    JOIN users u ON p.user_id = u.id
                    WHERE c.status = $1 AND p.user_id = $2
                    ORDER BY c.created_at DESC
                `;
                params = [status, userId];
            } else {
                // Insurance, Admin, Doctor see all claims by status
                query = `
                    SELECT c.*, u.name as patient_name, p.history as patient_history
                    FROM claims c
                    JOIN patients p ON c.patient_id = p.id
                    JOIN users u ON p.user_id = u.id
                    WHERE c.status = $1
                    ORDER BY c.created_at DESC
                `;
            }
            
            const result = await pool.query(query, params);
            res.json({ success: true, claims: result.rows });
        } catch (err) {
            console.error('Error fetching claims:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Create new claim with AI recommendation
    createClaim: async (req, res) => {
        try {
            const { patient_id, treatment, description, cost } = req.body;
            
            // Get patient history for AI analysis
            const patientQuery = 'SELECT history FROM patients WHERE id = $1';
            const patientResult = await pool.query(patientQuery, [patient_id]);
            const patientHistory = patientResult.rows[0]?.history || '';
            
            // Get AI recommendation
            const aiResult = mockAILogic(treatment, description, parseFloat(cost), patientHistory);
            
            const query = `
                INSERT INTO claims (patient_id, treatment, description, cost, status, ai_recommendation)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const status = aiResult.recommendation === 'APPROVE' ? 'approved' : 
                          aiResult.recommendation === 'FLAG' ? 'pending' : 'pending';
            
            const result = await pool.query(query, [
                patient_id, treatment, description, cost, status, 
                JSON.stringify(aiResult)
            ]);
            
            res.status(201).json({ 
                success: true, 
                claim: result.rows[0],
                aiAnalysis: aiResult
            });
        } catch (err) {
            console.error('Error creating claim:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Update claim status
    updateClaim: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const query = `
                UPDATE claims 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [status, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Claim not found' });
            }
            
            res.json({ success: true, claim: result.rows[0] });
        } catch (err) {
            console.error('Error updating claim:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get AI analysis for a claim
    getAIAnalysis: async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT c.*, u.name as patient_name, p.history as patient_history, p.age, p.gender
                FROM claims c
                JOIN patients p ON c.patient_id = p.id
                JOIN users u ON p.user_id = u.id
                WHERE c.id = $1
            `;
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Claim not found' });
            }
            
            const claim = result.rows[0];
            const aiResult = mockAILogic(
                claim.treatment, 
                claim.description, 
                parseFloat(claim.cost), 
                claim.patient_history
            );
            
            res.json({ 
                success: true, 
                claim: claim,
                aiAnalysis: aiResult
            });
        } catch (err) {
            console.error('Error analyzing claim:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get claim statistics
    getClaimStats: async (req, res) => {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                    COALESCE(SUM(cost), 0) as total_value,
                    COALESCE(SUM(cost) FILTER (WHERE status = 'approved'), 0) as approved_value
                FROM claims
            `;
            const statsResult = await pool.query(statsQuery);
            
            res.json({ success: true, stats: statsResult.rows[0] });
        } catch (err) {
            console.error('Error fetching claim stats:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = insuranceController;
