const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Get all patients
router.get('/', patientController.getAllPatients);

// Get single patient
router.get('/:id', patientController.getPatientById);

// Create patient
router.post('/', patientController.createPatient);

// Get patient summary
router.get('/summary/:patientId', patientController.getPatientSummary);

module.exports = router;
