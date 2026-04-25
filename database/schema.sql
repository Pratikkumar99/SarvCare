-- SarvCare Database Schema for Render PostgreSQL
-- Run this in your Render PostgreSQL database

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'insurance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    abha_id VARCHAR(100),
    history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    treatment VARCHAR(255) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE summaries (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    summary_text TEXT NOT NULL,
    generated_by_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_claims_patient_id ON claims(patient_id);
CREATE INDEX idx_summaries_patient_id ON summaries(patient_id);
CREATE INDEX idx_users_email ON users(email);

-- Insert sample admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin');

-- Insert sample doctor user
INSERT INTO users (name, email, password, role) VALUES 
('Dr. Smith', 'doctor@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'doctor');

-- Insert sample insurance user
INSERT INTO users (name, email, password, role) VALUES 
('Insurance Staff', 'insurance@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'insurance');

-- Insert sample patient user
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'patient@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'patient');

-- Insert sample patient data
INSERT INTO patients (user_id, name, email, age, gender, abha_id, history) VALUES 
(4, 'John Doe', 'patient@sarvcare.com', 35, 'Male', 'ABHA123456789', 'No chronic conditions. Regular checkups.');

COMMIT;
