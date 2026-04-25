import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    // Demo accounts for testing
    const demoAccounts = [
        { email: 'john@example.com', password: 'password', role: 'patient', name: 'John Doe' },
        { email: 'sarah@example.com', password: 'password', role: 'doctor', name: 'Dr. Sarah Smith' },
        { email: 'mike@insurance.com', password: 'password', role: 'insurance', name: 'Mike Insurance' },
        { email: 'admin@medisync.com', password: 'password', role: 'admin', name: 'Admin User' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const user = demoAccounts.find(
            acc => acc.email === formData.email && acc.password === formData.password
        );

        if (user) {
            const userData = { 
                id: user.email === 'john@example.com' ? 1 : 
                    user.email === 'sarah@example.com' ? 2 : 
                    user.email === 'mike@insurance.com' ? 3 : 4,
                email: user.email, 
                role: user.role, 
                name: user.name 
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate('/dashboard');
        } else {
            setError('Invalid email or password');
        }
    };

    const handleDemoLogin = (account) => {
        const userData = { 
            id: account.email === 'john@example.com' ? 1 : 
                account.email === 'sarah@example.com' ? 2 : 
                account.email === 'mike@insurance.com' ? 3 : 4,
            email: account.email, 
            role: account.role, 
            name: account.name 
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/dashboard');
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">SarvCare</h2>
                                    <p className="text-muted">Healthcare Management System</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Email address</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg w-100 mb-4">
                                        Sign In
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-muted mb-3">Or use a demo account:</p>
                                    <div className="d-grid gap-2">
                                        {demoAccounts.map((account, idx) => (
                                            <button
                                                key={idx}
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => handleDemoLogin(account)}
                                            >
                                                {account.name} ({account.role})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-muted mt-4">
                            <small>All demo accounts use password: "password"</small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
