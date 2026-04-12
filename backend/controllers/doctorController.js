const pool = require('../models/db');

const doctorController = {
    // Get all patients for a doctor
    getDoctorPatients: async (req, res) => {
        try {
            const query = `
                SELECT p.id, p.age, p.gender, p.history, p.created_at,
                       u.name, u.email
                FROM patients p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.id DESC
            `;
            const result = await pool.query(query);
            res.json({ success: true, patients: result.rows });
        } catch (err) {
            console.error('Error fetching patients:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Create prescription
    createPrescription: async (req, res) => {
        try {
            const { patient_id, doctor_id, medication, dosage, notes } = req.body;
            
            const query = `
                INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const result = await pool.query(query, [patient_id, doctor_id, medication, dosage, notes]);
            
            res.status(201).json({ success: true, prescription: result.rows[0] });
        } catch (err) {
            console.error('Error creating prescription:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get all prescriptions by doctor
    getDoctorPrescriptions: async (req, res) => {
        try {
            const { doctorId } = req.params;
            
            const query = `
                SELECT pr.*, u.name as patient_name
                FROM prescriptions pr
                JOIN patients p ON pr.patient_id = p.id
                JOIN users u ON p.user_id = u.id
                WHERE pr.doctor_id = $1
                ORDER BY pr.created_at DESC
            `;
            const result = await pool.query(query, [doctorId]);
            res.json({ success: true, prescriptions: result.rows });
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Create summary report
    createSummary: async (req, res) => {
        try {
            const { patient_id, generated_by, summary_text } = req.body;
            
            const query = `
                INSERT INTO summaries (patient_id, generated_by, summary_text)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await pool.query(query, [patient_id, generated_by, summary_text]);
            
            res.status(201).json({ success: true, summary: result.rows[0] });
        } catch (err) {
            console.error('Error creating summary:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = doctorController;
