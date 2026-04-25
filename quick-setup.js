// Quick database setup - no dependencies needed
const https = require('https');

// Use a simple HTTP request to test connection
const testConnection = () => {
    console.log('🔍 Testing backend connection...');
    
    const options = {
        hostname: 'sarvcare-backend.onrender.com',
        port: 443,
        path: '/api/health',
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        console.log(`✅ Backend status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📊 Response:', data);
            
            if (res.statusCode === 200) {
                console.log('🎉 Backend is ready!');
                console.log('🔗 Now test login:');
                console.log('curl -X POST https://sarvcare-backend.onrender.com/api/auth/login -H "Content-Type: application/json" -d \'{"email": "admin@sarvcare.com", "password": "password123"}\'');
            } else {
                console.log('❌ Backend has issues - check database setup');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.log('💡 Backend might be starting up - try again in 1-2 minutes');
    });

    req.end();
};

testConnection();
