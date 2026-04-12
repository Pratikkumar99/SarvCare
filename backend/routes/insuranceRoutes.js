const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

// Get all claims
router.get('/claims', insuranceController.getAllClaims);

// Get claims by status
router.get('/claims/status/:status', insuranceController.getClaimsByStatus);

// Create claim
router.post('/claims', insuranceController.createClaim);

// Update claim
router.put('/claims/:id', insuranceController.updateClaim);

// Get AI analysis for claim
router.get('/claims/:id/analysis', insuranceController.getAIAnalysis);

// Get claim statistics
router.get('/stats/claims', insuranceController.getClaimStats);

module.exports = router;
