// Simple database connection test
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://sarvcare_user:IBpj4NddAytvHfhEY0JzpQf66Bm3I8x5@dpg-d7m3m3reo5us73ejkvlg-a.oregon-postgres.render.com:5432/sarvcare',
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('🔗 Testing database connection...');
        await client.connect();
        console.log('✅ Connected successfully!');
        
        // Test basic query
        const result = await client.query('SELECT version()');
        console.log('📊 Database version:', result.rows[0].version);
        
        // Check if tables exist
        const tables = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('📋 Existing tables:', tables.rows.map(row => row.table_name));
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.log('💡 Possible fixes:');
        console.log('   1. Check database password');
        console.log('   2. Verify database is running');
        console.log('   3. Check network connectivity');
    } finally {
        await client.end();
        console.log('🔌 Connection closed');
    }
}

testConnection();
