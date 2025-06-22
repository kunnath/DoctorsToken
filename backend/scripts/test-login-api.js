const axios = require('axios');

const testLoginAPI = async () => {
  try {
    console.log('Testing admin login via API...');
    
    const loginData = {
      email: 'admin@doctorstoken.com',
      password: 'admin123456'
    };
    
    console.log('Sending login request with:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
testLoginAPI();
