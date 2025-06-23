const axios = require('axios');

async function testApiLoginWithDebug() {
  try {
    console.log('Testing admin login via API with debug...');
    
    // First, let's check what the server logs show
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@doctorstoken.com',
      password: 'admin123456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.user);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApiLoginWithDebug();
