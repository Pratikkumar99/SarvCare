const express = require('express');
const cors = require('cors');
require('dotenv').config();

const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for Render
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SarvCare API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 SarvCare Server running on port ${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   - Auth:      http://localhost:${PORT}/api/auth`);
    console.log(`   - Patients:  http://localhost:${PORT}/api/patients`);
    console.log(`   - Doctor:    http://localhost:${PORT}/api/doctor`);
    console.log(`   - Insurance: http://localhost:${PORT}/api/insurance`);
});
