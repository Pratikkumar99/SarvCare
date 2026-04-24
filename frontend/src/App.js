import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import InsuranceDashboard from './pages/InsuranceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SummaryPage from './pages/SummaryPage';
import Profile from './pages/Profile';
import './App.css';
import './styles/theme.css';
import './styles/Card.css';
import './styles/Dashboard.css';

const AppContent = ({ user, setUser }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    if (!user && !isLoginPage) {
        return <Navigate to="/login" replace />;
    }

    if (!user) {
        return <Login setUser={setUser} />;
    }

    return (
        <div className="app-container">
            {!isLoginPage && <Navbar userRole={user?.role} user={user} />}
            <div className="d-flex">
                {!isLoginPage && <Sidebar userRole={user?.role} />}
                <main className="flex-grow-1 p-4" style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: '#f8f9fa' }}>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard user={user} />} />
                        <Route path="/patient" element={<PatientDashboard user={user} />} />
                        <Route path="/doctor" element={<DoctorDashboard user={user} />} />
                        <Route path="/insurance" element={<InsuranceDashboard user={user} />} />
                        <Route path="/admin" element={<AdminDashboard user={user} />} />
                        <Route path="/summary/:patientId" element={<SummaryPage user={user} />} />
                        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
            <Chatbot user={user} />
        </div>
    );
};

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/signup" element={<Signup setUser={setUser} />} />
                    <Route path="/*" element={<AppContent user={user} setUser={setUser} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
