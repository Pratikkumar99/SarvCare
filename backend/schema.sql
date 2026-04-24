-- =====================================================
-- SarvCare Healthcare Management System - Database Schema
-- PostgreSQL 12+ Compatible
-- =====================================================

-- Drop tables if they exist (clean slate)
DROP TABLE IF EXISTS summaries CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 1. USERS TABLE
-- Stores all system users: patients, doctors, insurance staff, admins
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    abha_id VARCHAR(50) UNIQUE, -- ABHA ID (Ayushman Bharat Health Account)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'insurance', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON COLUMN users.role IS 'User role: patient, doctor, insurance, or admin';
COMMENT ON COLUMN users.abha_id IS 'ABHA ID - Ayushman Bharat Health Account (unique health identifier)';

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_abha_id ON users(abha_id);

-- =====================================================
-- 2. PATIENTS TABLE
-- Stores patient demographic and medical history
-- =====================================================
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER CHECK (age > 0 AND age < 150),
    gender VARCHAR(50) CHECK (gender IN ('Male', 'Female', 'Other')),
    history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE patients IS 'Patient records linked to users table';
COMMENT ON COLUMN patients.history IS 'Medical history and chronic conditions';

-- Index for faster patient lookups
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- =====================================================
-- 3. PRESCRIPTIONS TABLE
-- Stores medications prescribed by doctors
-- =====================================================
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE prescriptions IS 'Doctor prescriptions for patients';

-- Indexes for prescription queries
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);

-- =====================================================
-- 4. CLAIMS TABLE
-- Stores insurance claims with AI-powered recommendations
-- =====================================================
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment VARCHAR(255) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
    ai_recommendation JSONB,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE claims IS 'Insurance claims with AI prior authorization';
COMMENT ON COLUMN claims.ai_recommendation IS 'JSON object with AI analysis: recommendation, confidence, reason';
COMMENT ON COLUMN claims.status IS 'Claim status: approved, pending, or rejected';

-- Indexes for claim management
CREATE INDEX idx_claims_patient_id ON claims(patient_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at);

-- =====================================================
-- 5. SUMMARIES TABLE
-- Stores doctor-generated patient summary reports
-- =====================================================
CREATE TABLE summaries (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE summaries IS 'Doctor-generated patient summary reports';

-- Index for patient summary lookups
CREATE INDEX idx_summaries_patient_id ON summaries(patient_id);
CREATE INDEX idx_summaries_generated_by ON summaries(generated_by);

-- =====================================================
-- AUTO-UPDATE TRIGGER FOR updated_at columns
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users (password: 'password' for all)
-- bcrypt hash of 'password' with 10 salt rounds
INSERT INTO users (name, email, abha_id, password, role) VALUES
('John Doe', 'john@example.com', 'ABHA-1234-5678-9012', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'patient'),
('Dr. Sarah Smith', 'sarah@example.com', 'ABHA-DOC1-2345-6789', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'doctor'),
('Mike Insurance', 'mike@insurance.com', NULL, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'insurance'),
('Admin User', 'admin@sarvcare.com', NULL, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'admin'),
('Jane Wilson', 'jane@example.com', 'ABHA-9876-5432-1098', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'patient'),
('Dr. James Brown', 'james@example.com', 'ABHA-DOC2-8765-4321', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'doctor'),
('Raj Kumar', 'raj@example.com', 'ABHA-123-23-3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'patient'),
('Priya Sharma', 'priya@example.com', 'ABHA-123-23-23-2-1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52LgL5XkH4YK6', 'patient');

-- Insert patients (linked to users)
INSERT INTO patients (user_id, age, gender, history) VALUES
(1, 45, 'Male', 'Hypertension, Diabetes Type 2, High Cholesterol'),
(5, 32, 'Female', 'Asthma, Seasonal Allergies'),
(7, 28, 'Male', 'Migraine, Seasonal Allergies'),
(8, 35, 'Female', 'Thyroid, PCOS, Anemia'),
(9, 28, 'Male', 'Migraine, Seasonal Allergies'),
(10, 35, 'Female', 'Thyroid, PCOS, Anemia');

-- Insert prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, notes) VALUES
(1, 2, 'Metformin', '500mg twice daily', 'For diabetes management'),
(1, 2, 'Lisinopril', '10mg once daily', 'For blood pressure control'),
(2, 6, 'Albuterol', 'As needed', 'For asthma relief'),
(2, 6, 'Cetirizine', '10mg daily', 'For allergies');

-- Insert claims with AI recommendations
INSERT INTO claims (patient_id, treatment, description, cost, status, ai_recommendation) VALUES
(1, 'Diabetes Checkup', 'Regular diabetes monitoring and consultation', 150.00, 'approved', 
 '{"recommendation": "APPROVE", "confidence": 0.92, "reason": "Routine care for chronic condition"}'),
(1, 'Blood Pressure Medication', 'Lisinopril prescription refill', 45.00, 'approved',
 '{"recommendation": "APPROVE", "confidence": 0.88, "reason": "Preventive care recommended"}'),
(1, 'MRI Scan', 'MRI of lower back for chronic pain', 1200.00, 'pending',
 '{"recommendation": "FLAG", "confidence": 0.78, "reason": "High-cost procedure requires review"}'),
(2, 'Allergy Test', 'Comprehensive allergy testing panel', 300.00, 'pending',
 '{"recommendation": "PENDING", "confidence": 0.65, "reason": "Requires manual review"}'),
(2, 'Physical Therapy', '10 sessions for shoulder rehabilitation', 800.00, 'pending',
 '{"recommendation": "FLAG", "confidence": 0.72, "reason": "High cost treatment. Additional verification recommended"}');

-- Insert doctor summaries
INSERT INTO summaries (patient_id, summary_text, generated_by) VALUES
(1, 'Patient has stable diabetes and hypertension. Recent A1C: 7.2%. BP averaging 130/80. Continue current medications. Schedule follow-up in 3 months.', 2),
(2, 'Patient reports good asthma control with albuterol. Allergy symptoms improved with cetirizine. Recommend continuing current treatment plan.', 6);

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- =====================================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'claims', COUNT(*) FROM claims
UNION ALL
SELECT 'summaries', COUNT(*) FROM summaries;

-- View all tables created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
