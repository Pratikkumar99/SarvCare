// Test database connection using same credentials as backend
const { Pool } = require('pg');

// Test with DATABASE_URL
const pool = new Pool({
    connectionString: 'postgresql://sarvcare_user:IBpj4NddAytvHfhEY0JzpQf66Bm3I8x5@dpg-d7m3m3reo5us73ejkvlg-a.oregon-postgres.render.com:5432/sarvcare',
    ssl: {
        rejectUnauthorized: false
    }
});

async function testBackendConnection() {
    try {
        console.log('🔗 Testing backend database connection...');
        await pool.connect();
        console.log('✅ Backend database connection successful!');
        
        // Test user query
        const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@sarvcare.com']);
        console.log('👤 User query result:', result.rows);
        
        if (result.rows.length > 0) {
            console.log('🎉 Admin user found in database!');
            console.log('📊 User data:', result.rows[0]);
        } else {
            console.log('❌ Admin user not found in database');
        }
        
    } catch (error) {
        console.error('❌ Backend database connection failed:', error.message);
        console.log('💡 Possible fixes:');
        console.log('   1. Check DATABASE_URL in backend environment');
        console.log('   2. Verify database credentials');
        console.log('   3. Check if database is accessible');
    } finally {
        await pool.end();
        console.log('🔌 Connection closed');
    }
}

testBackendConnection();
