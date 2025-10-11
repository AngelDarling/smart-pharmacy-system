import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('🧪 Testing login...');
    
    // Test data
    const loginData = {
      email: 'admin@example.com',
      password: 'password123'
    };
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test register first
async function testRegister() {
  try {
    console.log('🧪 Testing register...');
    
    const registerData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    };
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Register successful!');
    } else {
      console.log('❌ Register failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testRegister();
  console.log('\n' + '='.repeat(50) + '\n');
  await testLogin();
}

runTests();
