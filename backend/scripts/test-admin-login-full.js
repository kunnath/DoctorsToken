const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@doctorstoken.com',
      password: 'admin123456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.role
    });
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
    // Test admin dashboard access
    console.log('\nTesting admin dashboard access...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard access successful!');
    console.log('Dashboard data keys:', Object.keys(dashboardResponse.data.data));
    
  } catch (error) {
    console.error('Login test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error message:', error.response.data.message);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Network error:', error.message);
    }
  }
};

testAdminLogin();
