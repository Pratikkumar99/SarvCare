const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/reports/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fs = require('fs');
const path = require('path');

// Download a report by ID
router.get('/reports/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../models/db');
    const result = await pool.query('SELECT file_path FROM reports WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const filePath = path.join(__dirname, '../uploads', result.rows[0].file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
const upload = multer({ storage: storage });

// Get all patients for doctor
router.get('/patients', doctorController.getDoctorPatients);

// Create prescription
router.post('/prescriptions', doctorController.createPrescription);

// Get doctor prescriptions
router.get('/prescriptions/:doctorId', doctorController.getDoctorPrescriptions);

// Create summary report
router.post('/summaries', doctorController.createSummary);

// Upload medical report
router.post('/reports', upload.single('report_file'), doctorController.uploadReport);

// Get doctor's uploaded reports
router.get('/reports/:doctorId', doctorController.getReports);

module.exports = router;
