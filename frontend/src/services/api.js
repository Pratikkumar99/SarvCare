import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Patient APIs
export const patientAPI = {
    getAll: () => api.get('/patients'),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    getSummary: (patientId) => api.get(`/patients/summary/${patientId}`)
};

// Doctor APIs
export const doctorAPI = {
    getPatients: () => api.get('/doctor/patients'),
    createPrescription: (data) => api.post('/doctor/prescriptions', data),
    getPrescriptions: (doctorId) => api.get(`/doctor/prescriptions/${doctorId}`),
    createSummary: (data) => api.post('/doctor/summaries', data)
};

// Insurance APIs
export const insuranceAPI = {
    getAllClaims: () => api.get('/insurance/claims'),
    getClaimsByStatus: (status) => api.get(`/insurance/claims/status/${status}`),
    createClaim: (data) => api.post('/insurance/claims', data),
    updateClaim: (id, data) => api.put(`/insurance/claims/${id}`, data),
    getAIAnalysis: (id) => api.get(`/insurance/claims/${id}/analysis`),
    getClaimStats: () => api.get('/insurance/stats/claims')
};

export default api;
