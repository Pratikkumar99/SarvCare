const pool = require('../models/db');

const doctorController = {
    // Get all patients for a doctor (showing all patients for now)
    getDoctorPatients: async (req, res) => {
        try {
            const doctorId = req.query.doctorId || req.user?.id || 2;
            console.log('getDoctorPatients called with doctorId:', doctorId);
            
            // For now, return all patients to ensure something shows up
            const query = `
                SELECT p.id, p.age, p.gender, p.history, p.created_at,
                       u.name, u.email
                FROM patients p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.id DESC
            `;
            const result = await pool.query(query);
            console.log('All patients returned:', result.rows);
            
            res.json({ success: true, patients: result.rows });
        } catch (err) {
            console.error('Error fetching patients:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                code: err.code
            });
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
    },

    // Upload medical report
    uploadReport: async (req, res) => {
        try {
            const { patient_id, report_title, doctor_id, uploaded_by_name } = req.body;
            const report_file = req.file;
            
            console.log('Upload request received:', {
                patient_id,
                report_title,
                doctor_id,
                uploaded_by_name,
                hasFile: !!report_file
            });
            
            if (!patient_id || !report_title || !doctor_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing required fields: patient_id, report_title, doctor_id' 
                });
            }
            
            let file_url = null;
            if (report_file) {
                // For now, store the file info. In production, you'd upload to cloud storage
                file_url = `/uploads/reports/${report_file.filename}`;
            }
            
            const query = `
                INSERT INTO reports (patient_id, doctor_id, report_title, report_type, description, file_url, uploaded_by_name)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const result = await pool.query(query, [
                patient_id,
                doctor_id,
                report_title,
                'Medical Report',
                report_file ? `Uploaded file: ${report_file.originalname}` : 'No file uploaded',
                file_url,
                uploaded_by_name
            ]);
            
            console.log('Report uploaded successfully:', result.rows[0]);
            res.status(201).json({ success: true, report: result.rows[0] });
        } catch (err) {
            console.error('Error uploading report:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get all reports uploaded by doctor
    getReports: async (req, res) => {
        try {
            const { doctorId } = req.params;
            
            const query = `
                SELECT r.*, p.user_id, u.name as patient_name
                FROM reports r
                JOIN patients p ON r.patient_id = p.id
                JOIN users u ON p.user_id = u.id
                WHERE r.doctor_id = $1
                ORDER BY r.created_at DESC
            `;
            const result = await pool.query(query, [doctorId]);
            res.json({ success: true, reports: result.rows });
        } catch (err) {
            console.error('Error fetching reports:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = doctorController;
