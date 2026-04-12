const pool = require('../models/db');

const initDatabase = async () => {
    try {
        console.log('Initializing database...');

        // Create tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) CHECK (role IN ('patient', 'doctor', 'insurance', 'admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                age INTEGER,
                gender VARCHAR(50),
                history TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS prescriptions (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                medication VARCHAR(255) NOT NULL,
                dosage VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS claims (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                treatment VARCHAR(255) NOT NULL,
                description TEXT,
                cost DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
                ai_recommendation VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS summaries (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                summary_text TEXT NOT NULL,
                generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Tables created successfully');

        // Insert sample data
        await insertSampleData();

        console.log('Database initialization completed!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

const insertSampleData = async () => {
    try {
        // Check if data already exists
        const userCheck = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCheck.rows[0].count) > 0) {
            console.log('Sample data already exists, skipping...');
            return;
        }

        // Insert users
        const usersResult = await pool.query(`
            INSERT INTO users (name, email, password, role) VALUES
            ('John Doe', 'john@example.com', '$2a$10$hash', 'patient'),
            ('Dr. Sarah Smith', 'sarah@example.com', '$2a$10$hash', 'doctor'),
            ('Mike Insurance', 'mike@insurance.com', '$2a$10$hash', 'insurance'),
            ('Admin User', 'admin@medisync.com', '$2a$10$hash', 'admin'),
            ('Jane Wilson', 'jane@example.com', '$2a$10$hash', 'patient'),
            ('Dr. James Brown', 'james@example.com', '$2a$10$hash', 'doctor')
            RETURNING id, name, role;
        `);

        const users = usersResult.rows;
        const patient = users.find(u => u.name === 'John Doe');
        const patient2 = users.find(u => u.name === 'Jane Wilson');
        const doctor = users.find(u => u.name === 'Dr. Sarah Smith');
        const doctor2 = users.find(u => u.name === 'Dr. James Brown');

        // Insert patients
        const patientsResult = await pool.query(`
            INSERT INTO patients (user_id, age, gender, history) VALUES
            (${patient.id}, 45, 'Male', 'Hypertension, Diabetes Type 2, High Cholesterol'),
            (${patient2.id}, 32, 'Female', 'Asthma, Seasonal Allergies')
            RETURNING id;
        `);

        const patientId = patientsResult.rows[0].id;
        const patientId2 = patientsResult.rows[1].id;

        // Insert prescriptions
        await pool.query(`
            INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, notes) VALUES
            (${patientId}, ${doctor.id}, 'Metformin', '500mg twice daily', 'For diabetes management'),
            (${patientId}, ${doctor.id}, 'Lisinopril', '10mg once daily', 'For blood pressure control'),
            (${patientId2}, ${doctor2.id}, 'Albuterol', 'As needed', 'For asthma relief'),
            (${patientId2}, ${doctor2.id}, 'Cetirizine', '10mg daily', 'For allergies');
        `);

        // Insert claims
        await pool.query(`
            INSERT INTO claims (patient_id, treatment, description, cost, status) VALUES
            (${patientId}, 'Diabetes Checkup', 'Regular diabetes monitoring and consultation', 150.00, 'approved'),
            (${patientId}, 'Blood Pressure Medication', 'Lisinopril prescription refill', 45.00, 'approved'),
            (${patientId}, 'MRI Scan', 'MRI of lower back for chronic pain', 1200.00, 'pending'),
            (${patientId2}, 'Allergy Test', 'Comprehensive allergy testing panel', 300.00, 'pending'),
            (${patientId2}, 'Physical Therapy', '10 sessions for shoulder rehabilitation', 800.00, 'pending');
        `);

        // Insert summaries
        await pool.query(`
            INSERT INTO summaries (patient_id, summary_text, generated_by) VALUES
            (${patientId}, 'Patient has stable diabetes and hypertension. Recent A1C: 7.2%. BP averaging 130/80. Continue current medications. Schedule follow-up in 3 months.', ${doctor.id}),
            (${patientId2}, 'Patient reports good asthma control with albuterol. Allergy symptoms improved with cetirizine. Recommend continuing current treatment plan.', ${doctor2.id});
        `);

        console.log('Sample data inserted successfully');
    } catch (err) {
        console.error('Error inserting sample data:', err);
        throw err;
    }
};

initDatabase();
