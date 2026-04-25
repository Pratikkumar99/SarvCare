// Quick database setup script
// Run with: node setup-database.js

const { Client } = require('pg');

const connectionString = 'postgresql://sarvcare_user:IBpj4NddAytvHfhEY0JzpQf66Bm3I8x5@dpg-d7m3m3reo5us73ejkvlg-a.oregon-postgres.render.com:5432/sarvcare';

const schema = `
-- SarvCare Database Schema for Render PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'insurance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
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

CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    treatment VARCHAR(255) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    summary_text TEXT NOT NULL,
    generated_by_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_summaries_patient_id ON summaries(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin');

INSERT INTO users (name, email, password, role) VALUES 
('Dr. Smith', 'doctor@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'doctor');

INSERT INTO users (name, email, password, role) VALUES 
('Insurance Staff', 'insurance@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'insurance');

INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'patient@sarvcare.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'patient');

-- Insert sample patient data
INSERT INTO patients (user_id, name, email, age, gender, abha_id, history) VALUES 
(4, 'John Doe', 'patient@sarvcare.com', 35, 'Male', 'ABHA123456789', 'No chronic conditions. Regular checkups.');

COMMIT;
`;

async function setupDatabase() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔗 Connecting to database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('🗄️ Creating tables and inserting data...');
        await client.query(schema);
        console.log('🎉 Database setup completed successfully!');

        // Verify tables were created
        const result = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📋 Tables created:', result.rows.map(row => row.table_name));

    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        await client.end();
        console.log('🔌 Connection closed');
    }
}

setupDatabase();
