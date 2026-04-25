// Check database schema
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://sarvcare_user:IBpj4NddAytvHfhEY0JzpQf66Bm3I8x5@dpg-d7m3m3reo5us73ejkvlg-a.oregon-postgres.render.com:5432/sarvcare',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkSchema() {
    try {
        console.log('🔗 Checking database schema...');
        await pool.connect();
        
        // Check users table structure
        const usersResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Users table columns:');
        usersResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // Check sample user data
        const userData = await pool.query('SELECT * FROM users LIMIT 1');
        console.log('👤 Sample user data:', userData.rows[0]);
        
    } catch (error) {
        console.error('❌ Schema check error:', error.message);
    } finally {
        await pool.end();
        console.log('🔌 Connection closed');
    }
}

checkSchema();
