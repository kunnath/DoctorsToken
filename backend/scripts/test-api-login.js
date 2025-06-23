const axios = require('axios');

async function testApiLogin() {
  try {
    console.log('Testing admin login via API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@doctorstoken.com',
      password: 'admin123456'
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
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApiLogin();
