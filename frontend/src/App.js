import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import InsuranceDashboard from './pages/InsuranceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SummaryPage from './pages/SummaryPage';
import './App.css';

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
            {!isLoginPage && <Navbar userRole={user?.role} />}
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
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
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
        <Router>
            <Routes>
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/*" element={<AppContent user={user} setUser={setUser} />} />
            </Routes>
        </Router>
    );
}

export default App;
