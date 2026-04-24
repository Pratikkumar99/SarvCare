const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Get all patients
router.get('/', patientController.getAllPatients);

// Search patient by ABHA ID
router.get('/search/abha/:abhaId', patientController.getPatientByAbhaId);

// Get single patient
router.get('/:id', patientController.getPatientById);

// Create patient
router.post('/', patientController.createPatient);

// Get patient summary
router.get('/summary/:patientId', patientController.getPatientSummary);

module.exports = router;
