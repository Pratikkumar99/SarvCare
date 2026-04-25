const pool = require('../models/db');

// Mock AI logic for claim approval
const mockAILogic = (treatment, patientHistory) => {
    const history = patientHistory ? patientHistory.toLowerCase() : '';
    const treatmentLower = treatment.toLowerCase();
    
    // Simple rule-based logic
    const chronicConditions = ['diabetes', 'hypertension', 'asthma', 'heart disease'];
    const isChronicRelated = chronicConditions.some(condition => 
        history.includes(condition) && treatmentLower.includes(condition)
    );
    
    const preventiveCare = ['checkup', 'vaccination', 'screening', 'test'];
    const isPreventive = preventiveCare.some(care => treatmentLower.includes(care));
    
    const highCostKeywords = ['surgery', 'transplant', 'experimental', 'mri', 'ct scan'];
    const isHighCost = highCostKeywords.some(keyword => treatmentLower.includes(keyword));
    
    if (isChronicRelated && isPreventive) {
        return { recommendation: 'APPROVE', confidence: 0.92, reason: 'Routine care for chronic condition' };
    } else if (isHighCost && !isChronicRelated) {
        return { recommendation: 'FLAG', confidence: 0.78, reason: 'High-cost procedure requires review' };
    } else if (isPreventive) {
        return { recommendation: 'APPROVE', confidence: 0.88, reason: 'Preventive care recommended' };
    } else {
        return { recommendation: 'PENDING', confidence: 0.65, reason: 'Requires manual review' };
    }
};

const patientController = {
    // Get all patients (filtered by user role)
    getAllPatients: async (req, res) => {
        try {
            const { userId, userRole } = req.query;
            
            let query;
            let params = [];
            
            if (userRole === 'patient' && userId) {
                // Patients see only their own record
                query = `
                    SELECT p.id, p.age, p.gender, p.history, p.created_at,
                           u.name, u.email
                    FROM patients p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.user_id = $1
                    ORDER BY p.id DESC
                `;
                params = [userId];
            } else if (userRole === 'doctor' && userId) {
                // Doctors see ALL patients so they can select and create prescriptions
                query = `
                    SELECT DISTINCT p.id, p.age, p.gender, p.history, p.created_at,
                           u.name, u.email, u.abha_id,
                           u.name, u.email,
                           CASE WHEN pr.doctor_id = $1 THEN true ELSE false END as is_assigned
                    FROM patients p
                    JOIN users u ON p.user_id = u.id
                    LEFT JOIN prescriptions pr ON p.id = pr.patient_id AND pr.doctor_id = $1
                    ORDER BY is_assigned DESC, p.id DESC
                `;
                params = [userId];
            } else {
                // Admin/Insurance see all patients
                query = `
                    SELECT p.id, p.age, p.gender, p.history, p.created_at,
                           u.name, u.email
                    FROM patients p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY p.id DESC
                `;
            }
            
            const result = await pool.query(query, params);
            res.json({ success: true, patients: result.rows });
        } catch (err) {
            console.error('Error fetching patients:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get single patient with details (with permission check)
    getPatientById: async (req, res) => {
        try {
            const { id } = req.params;
            const { userId, userRole } = req.query;
            
            // First check if patient exists and get user_id
            const patientCheckQuery = `
                SELECT p.*, u.id as user_id, u.name, u.email
                FROM patients p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = $1
            `;
            const patientCheckResult = await pool.query(patientCheckQuery, [id]);
            
            if (patientCheckResult.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Patient not found' });
            }
            
            const patient = patientCheckResult.rows[0];
            
            // Check permissions - patients can only view their own records
            if (userRole === 'patient' && patient.user_id != userId) {
                return res.status(403).json({ success: false, error: 'Access denied. You can only view your own records.' });
            }
            
            // Get prescriptions
            const prescriptionsQuery = `
                SELECT pr.*, u.name as doctor_name
                FROM prescriptions pr
                JOIN users u ON pr.doctor_id = u.id
                WHERE pr.patient_id = $1
                ORDER BY pr.created_at DESC
            `;
            const prescriptionsResult = await pool.query(prescriptionsQuery, [id]);
            
            // Get claims
            const claimsQuery = `
                SELECT * FROM claims 
                WHERE patient_id = $1 
                ORDER BY created_at DESC
            `;
            const claimsResult = await pool.query(claimsQuery, [id]);
            
            // Get summaries
            const summariesQuery = `
                SELECT s.*, u.name as generated_by_name
                FROM summaries s
                JOIN users u ON s.generated_by = u.id
                WHERE s.patient_id = $1
                ORDER BY s.created_at DESC
            `;
            const summariesResult = await pool.query(summariesQuery, [id]);
            
            // Get reports
            const reportsQuery = `
                SELECT r.*, u.name as uploaded_by_name
                FROM reports r
                JOIN users u ON r.doctor_id = u.id
                WHERE r.patient_id = $1
                ORDER BY r.created_at DESC
            `;
            const reportsResult = await pool.query(reportsQuery, [id]);
            
            res.json({
                success: true,
                patient: {
                    ...patient,
                    prescriptions: prescriptionsResult.rows,
                    claims: claimsResult.rows,
                    summaries: summariesResult.rows,
                    reports: reportsResult.rows
                }
            });
        } catch (err) {
            console.error('Error fetching patient:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Create new patient
    createPatient: async (req, res) => {
        try {
            const { name, email, password, age, gender, history } = req.body;
            
            // First create user
            const userQuery = `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, 'patient')
                RETURNING id
            `;
            const userResult = await pool.query(userQuery, [name, email, password || '$2a$10$hash']);
            const userId = userResult.rows[0].id;
            
            // Then create patient record
            const patientQuery = `
                INSERT INTO patients (user_id, age, gender, history)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const patientResult = await pool.query(patientQuery, [userId, age, gender, history]);
            
            res.status(201).json({
                success: true,
                patient: { ...patientResult.rows[0], name, email }
            });
        } catch (err) {
            console.error('Error creating patient:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get patient summary
    getPatientSummary: async (req, res) => {
        try {
            const { patientId } = req.params;
            const { userId, userRole } = req.query;
            
            // Check permissions for patients
            if (userRole === 'patient') {
                const checkQuery = 'SELECT user_id FROM patients WHERE id = $1';
                const checkResult = await pool.query(checkQuery, [patientId]);
                if (checkResult.rows.length === 0 || checkResult.rows[0].user_id != userId) {
                    return res.status(403).json({ success: false, error: 'Access denied' });
                }
            }
            
            const query = `
                SELECT s.*, u.name as generated_by_name,
                       p.age, p.gender, p.history,
                       pu.name as patient_name
                FROM summaries s
                JOIN users u ON s.generated_by = u.id
                JOIN patients p ON s.patient_id = p.id
                JOIN users pu ON p.user_id = pu.id
                WHERE s.patient_id = $1
                ORDER BY s.created_at DESC
                LIMIT 1
            `;
            const result = await pool.query(query, [patientId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'No summary found' });
            }
            
            res.json({ success: true, summary: result.rows[0] });
        } catch (err) {
            console.error('Error fetching summary:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Search patient by ABHA ID
    getPatientByAbhaId: async (req, res) => {
        try {
            const { abhaId } = req.params;
            const { userId, userRole } = req.query;

            const query = `
                SELECT p.id, p.age, p.gender, p.history, p.created_at,
                       u.id as user_id, u.name, u.email, u.abha_id
                FROM patients p
                JOIN users u ON p.user_id = u.id
                WHERE u.abha_id = $1
            `;
            const result = await pool.query(query, [abhaId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Patient not found with this ABHA ID' });
            }

            // Check if doctor can access this patient
            if (userRole === 'doctor' && userId) {
                const checkQuery = `
                    SELECT 1 FROM prescriptions 
                    WHERE patient_id = $1 AND doctor_id = $2 
                    LIMIT 1
                `;
                const checkResult = await pool.query(checkQuery, [result.rows[0].id, userId]);
                result.rows[0].is_assigned = checkResult.rows.length > 0;
            }

            res.json({ success: true, patient: result.rows[0] });
        } catch (err) {
            console.error('Error searching by ABHA ID:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = patientController;
