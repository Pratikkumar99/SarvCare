const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../models/db');

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // Find user by email
        const result = await pool.query(
            'SELECT id, name, email, age, password, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, age, abhaId, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if ABHA ID already exists (if provided)
        if (abhaId) {
            const existingAbha = await pool.query(
                'SELECT id FROM users WHERE abha_id = $1',
                [abhaId]
            );
            if (existingAbha.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ABHA ID already registered'
                });
            }
        }

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, age, abha_id, password, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, age, abha_id, role`,
            [name, email, age || null, abhaId || null, hashedPassword, role]
        );

        const newUser = result.rows[0];

        // If registering as patient, auto-create patient record
        if (role === 'patient') {
            await pool.query(
                `INSERT INTO patients (user_id, age, gender, history)
                 VALUES ($1, $2, $3, $4)`,
                [newUser.id, age, 'Other', 'No medical history recorded yet']
            );
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: newUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

module.exports = router;
