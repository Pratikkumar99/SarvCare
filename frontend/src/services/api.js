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
    getAll: (userId, userRole) => api.get(`/patients?userId=${userId}&userRole=${userRole}`),
    getById: (id, userId, userRole) => api.get(`/patients/${id}?userId=${userId}&userRole=${userRole}`),
    create: (data) => api.post('/patients', data),
    getSummary: (patientId, userId, userRole) => api.get(`/patients/summary/${patientId}?userId=${userId}&userRole=${userRole}`),
    searchByAbhaId: (abhaId, userId, userRole) => api.get(`/patients/search/abha/${abhaId}?userId=${userId}&userRole=${userRole}`)
};

// Doctor APIs
export const doctorAPI = {
    getPatients: (doctorId) => api.get(`/doctor/patients?doctorId=${doctorId}`),
    createPrescription: (data) => api.post('/doctor/prescriptions', data),
    getPrescriptions: (doctorId) => api.get(`/doctor/prescriptions/${doctorId}`),
    createSummary: (data) => api.post('/doctor/summaries', data),
    uploadReport: (formData) => api.post('/doctor/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getReports: (doctorId) => api.get(`/doctor/reports/${doctorId}`)
};

// Insurance APIs
export const insuranceAPI = {
    getAllClaims: (userId, userRole) => api.get('/insurance/claims', { params: { userId, userRole } }),
    getClaimsByStatus: (status, userId, userRole) => api.get(`/insurance/claims/status/${status}`, { params: { userId, userRole } }),
    createClaim: (data) => api.post('/insurance/claims', data),
    updateClaim: (id, data) => api.put(`/insurance/claims/${id}`, data),
    getAIAnalysis: (id) => api.get(`/insurance/claims/${id}/analysis`),
    getClaimStats: () => api.get('/insurance/stats/claims')
};

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Chatbot APIs
export const chatbotAPI = {
    chat: (message, userContext) => api.post('/chatbot/chat', { message, userContext }),
    getStatus: () => api.get('/chatbot/status')
};

export { API_URL };
export default api;
