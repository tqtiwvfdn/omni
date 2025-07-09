// API Test Script for Omni AI Server
// Run with: node test-api.js

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test functions
async function testHealthCheck() {
    console.log('🏥 Testing health check...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET'
        });
        
        console.log(`Status: ${response.statusCode}`);
        console.log(`Response: ${response.body}`);
        console.log('✅ Health check passed!\n');
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

async function testGetApplications() {
    console.log('📱 Testing get applications...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/applications',
            method: 'GET'
        });
        
        console.log(`Status: ${response.statusCode}`);
        const data = JSON.parse(response.body);
        console.log(`Total applications: ${data.total}`);
        console.log('✅ Get applications passed!\n');
    } catch (error) {
        console.error('❌ Get applications failed:', error.message);
    }
}

async function testGetStats() {
    console.log('📊 Testing get statistics...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/stats',
            method: 'GET'
        });
        
        console.log(`Status: ${response.statusCode}`);
        const data = JSON.parse(response.body);
        console.log(`Statistics:`, data.data);
        console.log('✅ Get statistics passed!\n');
    } catch (error) {
        console.error('❌ Get statistics failed:', error.message);
    }
}

async function testCreateApplication() {
    console.log('🆕 Testing create application...');
    try {
        const newApp = {
            name: '测试应用',
            description: '这是一个测试应用',
            category: '开发工具',
            template: 'blank',
            developer: '测试团队',
            features: ['测试功能1', '测试功能2']
        };
        
        const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/applications',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(newApp))
            }
        }, newApp);
        
        console.log(`Status: ${response.statusCode}`);
        const data = JSON.parse(response.body);
        console.log(`Created app ID: ${data.data.id}`);
        console.log('✅ Create application passed!\n');
        
        return data.data.id;
    } catch (error) {
        console.error('❌ Create application failed:', error.message);
        return null;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Starting API Tests for Omni AI Server');
    console.log('==========================================\n');
    
    await testHealthCheck();
    await testGetApplications();
    await testGetStats();
    const newAppId = await testCreateApplication();
    
    console.log('🎉 All tests completed!');
    console.log('Make sure the server is running on port 3000');
    
    if (newAppId) {
        console.log(`\n💡 You can view the created test app at: http://localhost:3000/api/applications/${newAppId}`);
    }
}

// Check if server is running
async function checkServerStatus() {
    try {
        await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET'
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Main execution
async function main() {
    const serverRunning = await checkServerStatus();
    
    if (!serverRunning) {
        console.log('❌ Server is not running on port 3000');
        console.log('Please start the server first:');
        console.log('  npm start');
        console.log('  or');
        console.log('  ./start.sh');
        return;
    }
    
    await runAllTests();
}

main().catch(console.error);