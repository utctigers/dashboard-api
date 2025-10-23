// Quick API test script
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Dashboard API...\n');
    
    // Test health check
    console.log('1. Health Check:');
    const health = await axios.get('http://localhost:3001/health');
    console.log('✅', health.data);
    
    // Test get employees
    console.log('\n2. Get Employees:');
    const employees = await axios.get(`${API_BASE}/employees`);
    console.log('✅', `Found ${employees.data.length} employees`);
    
    // Test get stats
    console.log('\n3. Get Stats:');
    const stats = await axios.get(`${API_BASE}/employees/stats`);
    console.log('✅', stats.data);
    
    // Test create employee
    console.log('\n4. Create Employee:');
    const newEmployee = {
      name: 'Test User',
      email: 'test@company.com',
      phone: '(555) 999-0000',
      department: 'IT',
      role: 'Developer',
      salary: 75000,
      start_date: '2024-01-01',
      status: 'Active'
    };
    const created = await axios.post(`${API_BASE}/employees`, newEmployee);
    console.log('✅', 'Employee created:', created.data.name);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();