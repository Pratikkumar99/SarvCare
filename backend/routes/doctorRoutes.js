const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Get all patients for doctor
router.get('/patients', doctorController.getDoctorPatients);

// Create prescription
router.post('/prescriptions', doctorController.createPrescription);

// Get doctor prescriptions
router.get('/prescriptions/:doctorId', doctorController.getDoctorPrescriptions);

// Create summary report
router.post('/summaries', doctorController.createSummary);

module.exports = router;
