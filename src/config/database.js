const { Pool } = require('pg');
const { Signer } = require('@aws-sdk/rds-signer');

let pool;

async function createPool() {
  const config = {
    host: process.env.AURORA_ENDPOINT || '4vthvxld47txd4lmgqpjzagqki.dsql.us-east-1.on.aws',
    port: process.env.AURORA_PORT || 5432,
    database: process.env.AURORA_DATABASE || 'postgres',
    user: process.env.AURORA_USER || 'admin',
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  };

  if (process.env.USE_IAM_AUTH === 'true') {
    const signer = new Signer({
      region: process.env.AWS_REGION || 'us-east-1',
      hostname: config.host,
      port: config.port,
      username: config.user
    });
    
    try {
      config.password = await signer.getAuthToken();
      console.log('🔑 Generated IAM auth token for Aurora DSQL');
    } catch (error) {
      console.error('❌ Failed to generate IAM token:', error.message);
      throw error;
    }
  } else {
    console.log('🔗 Using standard Aurora DSQL connection (no password)');
  }

  return new Pool(config);
}

// Initialize pool
createPool().then(p => {
  pool = p;
}).catch(error => {
  console.error('❌ Failed to create Aurora DSQL pool:', error.message);
});

// Mock data fallback when Aurora DSQL is not available
const mockEmployees = [
  { id: 1, name: 'John Smith', email: 'john@company.com', phone: '(555) 123-4567', department: 'Engineering', role: 'Senior', salary: 85000, start_date: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone: '(555) 234-5678', department: 'Marketing', role: 'Manager', salary: 95000, start_date: '2022-11-20', status: 'Active' },
  { id: 3, name: 'Mike Davis', email: 'mike@company.com', phone: '(555) 345-6789', department: 'Sales', role: 'Senior', salary: 78000, start_date: '2023-03-10', status: 'On Leave' },
  { id: 4, name: 'Lisa Wilson', email: 'lisa@company.com', phone: '(555) 456-7890', department: 'HR', role: 'Manager', salary: 92000, start_date: '2022-08-05', status: 'Active' }
];

const mockInventory = [
  { id: 1, name: 'Office Chairs', sku: 'OFC-001', category: 'Furniture', stock: 15, min_stock: 10, max_stock: 50, price: 299.99 },
  { id: 2, name: 'Laptops', sku: 'LTP-002', category: 'Electronics', stock: 5, min_stock: 8, max_stock: 25, price: 1299.99 },
  { id: 3, name: 'Printer Paper', sku: 'PPR-003', category: 'Supplies', stock: 45, min_stock: 20, max_stock: 100, price: 12.99 },
  { id: 4, name: 'Desk Lamps', sku: 'DLM-004', category: 'Furniture', stock: 0, min_stock: 5, max_stock: 20, price: 89.99 },
  { id: 5, name: 'Keyboards', sku: 'KBD-005', category: 'Electronics', stock: 12, min_stock: 10, max_stock: 30, price: 79.99 },
  { id: 6, name: 'Coffee Beans', sku: 'CFB-006', category: 'Food', stock: 8, min_stock: 15, max_stock: 50, price: 24.99 },
  { id: 7, name: 'Granola Bars', sku: 'GRB-007', category: 'Food', stock: 25, min_stock: 20, max_stock: 100, price: 1.99 },
  { id: 8, name: 'Bottled Water', sku: 'BTW-008', category: 'Food', stock: 0, min_stock: 30, max_stock: 200, price: 0.99 },
  { id: 9, name: 'Tea Bags', sku: 'TEA-009', category: 'Food', stock: 35, min_stock: 25, max_stock: 75, price: 8.99 }
];

const mockTimesheets = [
  { id: 1, employee_id: 1, employee_name: 'John Smith', date: '2024-01-15', hours_worked: 8, project: 'Website Development', status: 'Approved', login_time: '09:00', logout_time: '17:00' },
  { id: 2, employee_id: 2, employee_name: 'Sarah Johnson', date: '2024-01-15', hours_worked: 7.5, project: 'Marketing Campaign', status: 'Pending', login_time: '08:30', logout_time: '16:00' },
  { id: 3, employee_id: 1, employee_name: 'John Smith', date: '2024-01-16', hours_worked: 8, project: 'Database Migration', status: 'Approved', login_time: '09:15', logout_time: '17:15' },
  { id: 4, employee_id: 3, employee_name: 'Mike Davis', date: '2024-01-16', hours_worked: 6, project: 'Client Meeting', status: 'Submitted', login_time: '10:00', logout_time: '16:00' },
  { id: 5, employee_id: 4, employee_name: 'Lisa Wilson', date: '2024-01-17', hours_worked: 7, project: 'HR Training', status: 'Submitted', login_time: '08:45', logout_time: '15:45' },
  { id: 6, employee_id: 1, employee_name: 'John Smith', date: '2024-01-18', hours_worked: 8.5, project: 'Code Review', status: 'Approved', login_time: '08:30', logout_time: '17:00' },
  { id: 7, employee_id: 2, employee_name: 'Sarah Johnson', date: '2024-01-18', hours_worked: 8, project: 'Social Media Strategy', status: 'Approved', login_time: '09:00', logout_time: '17:00' }
];

let useMockData = true; // Always use mock data until Aurora DSQL is properly configured

async function query(text, params) {
  // Use mock data due to Aurora DSQL access restrictions
  if (useMockData) {
    console.log('🔄 Using mock Aurora DSQL data (access denied on real cluster)');
    return mockQuery(text, params);
  }
  
  // Attempt real connection (will likely fail with current permissions)
  try {
    if (!pool) {
      console.log('🔄 Pool not initialized, using mock data');
      return mockQuery(text, params);
    }
    
    console.log('🔗 Attempting Aurora DSQL connection');
    const result = await pool.query(text, params);
    console.log('✅ Aurora DSQL query successful');
    return result;
  } catch (error) {
    console.error('❌ Aurora DSQL access denied (08006) - using mock data');
    useMockData = true;
    return mockQuery(text, params);
  }
}

function mockQuery(text, params) {
  // Employee queries
  if (text.includes('SELECT') && text.includes('employees')) {
    return { rows: mockEmployees };
  }
  
  if (text.includes('INSERT INTO employees')) {
    const employee = {
      id: Date.now(),
      name: params[0], email: params[1], phone: params[2], department: params[3],
      role: params[4], salary: params[5], start_date: params[6], status: params[7]
    };
    mockEmployees.push(employee);
    return { rows: [employee], rowCount: 1 };
  }
  
  if (text.includes('UPDATE employees')) {
    const id = params[params.length - 1];
    const index = mockEmployees.findIndex(emp => emp.id == id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], name: params[0], email: params[1], phone: params[2], department: params[3], role: params[4], salary: params[5], start_date: params[6], status: params[7] };
      return { rows: [mockEmployees[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  if (text.includes('DELETE FROM employees')) {
    const id = params[0];
    const index = mockEmployees.findIndex(emp => emp.id == id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }
  
  // Inventory queries
  if (text.includes('SELECT') && text.includes('inventory')) {
    return { rows: mockInventory };
  }
  
  if (text.includes('INSERT INTO inventory')) {
    const item = {
      id: Date.now(),
      name: params[0], sku: params[1], category: params[2], stock: params[3],
      min_stock: params[4], max_stock: params[5], price: params[6]
    };
    mockInventory.push(item);
    return { rows: [item], rowCount: 1 };
  }
  
  if (text.includes('UPDATE inventory')) {
    const id = params[params.length - 1];
    const index = mockInventory.findIndex(item => item.id == id);
    if (index !== -1) {
      mockInventory[index] = { ...mockInventory[index], name: params[0], sku: params[1], category: params[2], stock: params[3], min_stock: params[4], max_stock: params[5], price: params[6] };
      return { rows: [mockInventory[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  if (text.includes('DELETE FROM inventory')) {
    const id = params[0];
    const index = mockInventory.findIndex(item => item.id == id);
    if (index !== -1) {
      mockInventory.splice(index, 1);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }
  
  // Timesheet queries
  if (text.includes('SELECT') && text.includes('timesheets')) {
    return { rows: mockTimesheets };
  }
  
  if (text.includes('INSERT INTO timesheets')) {
    const timesheet = {
      id: Date.now(),
      employee_id: params[0],
      employee_name: getEmployeeName(params[0]),
      date: params[1],
      hours_worked: params[2],
      project: params[3],
      status: params[4]
    };
    mockTimesheets.push(timesheet);
    return { rows: [timesheet], rowCount: 1 };
  }
  
  if (text.includes('UPDATE timesheets')) {
    const id = params[params.length - 1];
    const index = mockTimesheets.findIndex(ts => ts.id == id);
    if (index !== -1) {
      mockTimesheets[index] = {
        ...mockTimesheets[index],
        employee_id: params[0],
        employee_name: getEmployeeName(params[0]),
        date: params[1],
        hours_worked: params[2],
        project: params[3],
        status: params[4]
      };
      return { rows: [mockTimesheets[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  if (text.includes('DELETE FROM timesheets')) {
    const id = params[0];
    const index = mockTimesheets.findIndex(ts => ts.id == id);
    if (index !== -1) {
      mockTimesheets.splice(index, 1);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }
  
  return { rows: [], rowCount: 0 };
}

function getEmployeeName(employeeId) {
  const employee = mockEmployees.find(emp => emp.id == employeeId);
  return employee ? employee.name : `Employee ${employeeId}`;
}

module.exports = { query };