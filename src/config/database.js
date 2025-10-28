const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'dashboard';

const TABLES = {
  EMPLOYEES: `${TABLE_PREFIX}-employees`,
  INVENTORY: `${TABLE_PREFIX}-inventory`,
  TIMESHEETS: `${TABLE_PREFIX}-timesheets`,
  TIMESHEET_LOGS: `${TABLE_PREFIX}-timesheet-logs`
};

// Mock data fallback
const mockEmployees = [
  { id: 1, name: 'John Smith', email: 'john@company.com', phone: '(555) 123-4567', department: 'Engineering', role: 'Senior', salary: 85000, start_date: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone: '(555) 234-5678', department: 'Marketing', role: 'Manager', salary: 95000, start_date: '2022-11-20', status: 'Active' },
  { id: 3, name: 'Mike Davis', email: 'mike@company.com', phone: '(555) 345-6789', department: 'Sales', role: 'Senior', salary: 78000, start_date: '2023-03-10', status: 'On Leave' },
  { id: 4, name: 'Lisa Wilson', email: 'lisa@company.com', phone: '(555) 456-7890', department: 'HR', role: 'Manager', salary: 92000, start_date: '2022-08-05', status: 'Active' }
];

const mockTimesheets = [
  { id: 1, employee_id: 1, employee_name: 'John Smith', date: '2024-01-15', hours_worked: 8, project: 'Website Development', status: 'Approved' },
  { id: 2, employee_id: 2, employee_name: 'Sarah Johnson', date: '2024-01-15', hours_worked: 7.5, project: 'Marketing Campaign', status: 'Pending' }
];

const mockTimesheetLogs = [
  { id: 1, employee_id: 1, login_time: '2024-01-15T09:00:00Z', logout_time: '2024-01-15T17:00:00Z', login_latitude: 40.7128, login_longitude: -74.0060, logout_latitude: 40.7128, logout_longitude: -74.0060, status: 'logged_out' }
];

let useMockData = false;

async function query(text, params) {
  if (useMockData) {
    console.log('🔄 Using mock data (DynamoDB tables not configured)');
    return mockQuery(text, params);
  }
  
  try {
    return await dynamoQuery(text, params);
  } catch (error) {
    console.error('❌ DynamoDB error, falling back to mock data:', error.message);
    useMockData = true;
    return mockQuery(text, params);
  }
}

async function dynamoQuery(text, params) {
  // Employee operations
  if (text.includes('SELECT') && text.includes('employees')) {
    if (text.includes('WHERE id =')) {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.EMPLOYEES,
        Key: { id: parseInt(params[0]) },
        ConsistentRead: true
      }));
      return { rows: result.Item ? [result.Item] : [] };
    }
    
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.EMPLOYEES
    }));
    return { rows: result.Items || [] };
  }
  
  if (text.includes('INSERT INTO employees')) {
    const employee = {
      id: Date.now(),
      name: params[0], email: params[1], phone: params[2], department: params[3],
      role: params[4], salary: params[5], start_date: params[6], status: params[7]
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLES.EMPLOYEES,
      Item: employee
    }));
    
    return { rows: [employee], rowCount: 1 };
  }
  
  if (text.includes('UPDATE employees')) {
    const id = parseInt(params[params.length - 1]);
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.EMPLOYEES,
      Key: { id },
      UpdateExpression: 'SET #name = :name, email = :email, phone = :phone, department = :department, #role = :role, salary = :salary, start_date = :start_date, #status = :status',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#role': 'role',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':name': params[0],
        ':email': params[1],
        ':phone': params[2],
        ':department': params[3],
        ':role': params[4],
        ':salary': params[5],
        ':start_date': params[6],
        ':status': params[7]
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    return { rows: [result.Attributes], rowCount: 1 };
  }
  
  if (text.includes('DELETE FROM employees')) {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.EMPLOYEES,
      Key: { id: parseInt(params[0]) }
    }));
    
    return { rowCount: 1 };
  }
  
  // Timesheets operations
  if (text.includes('SELECT') && text.includes('timesheets') && !text.includes('timesheet_logs')) {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.TIMESHEETS
    }));
    return { rows: result.Items || [] };
  }
  
  if (text.includes('INSERT INTO timesheets')) {
    const timesheet = {
      id: Date.now(),
      employee_id: params[0], date: params[1], hours_worked: params[2], project: params[3], status: params[4]
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLES.TIMESHEETS,
      Item: timesheet
    }));
    
    return { rows: [timesheet], rowCount: 1 };
  }
  
  if (text.includes('UPDATE timesheets')) {
    const id = parseInt(params[params.length - 1]);
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.TIMESHEETS,
      Key: { id },
      UpdateExpression: 'SET employee_id = :employee_id, #date = :date, hours_worked = :hours_worked, project = :project, #status = :status',
      ExpressionAttributeNames: {
        '#date': 'date',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':employee_id': params[0],
        ':date': params[1],
        ':hours_worked': params[2],
        ':project': params[3],
        ':status': params[4]
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    return { rows: [result.Attributes], rowCount: 1 };
  }
  
  if (text.includes('DELETE FROM timesheets')) {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.TIMESHEETS,
      Key: { id: parseInt(params[0]) }
    }));
    
    return { rowCount: 1 };
  }
  
  // Timesheet logs operations
  if (text.includes('SELECT') && text.includes('timesheet_logs')) {
    if (text.includes('WHERE employee_id =')) {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.TIMESHEET_LOGS,
        FilterExpression: 'employee_id = :employee_id',
        ExpressionAttributeValues: {
          ':employee_id': parseInt(params[0])
        }
      }));
      return { rows: result.Items || [] };
    }
    
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.TIMESHEET_LOGS
    }));
    return { rows: result.Items || [] };
  }
  
  if (text.includes('INSERT INTO timesheet_logs')) {
    const log = {
      id: Date.now(),
      employee_id: params[0], login_time: params[1], login_latitude: params[2], login_longitude: params[3],
      phone_type: params[4], phone_number: params[5], status: params[6]
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLES.TIMESHEET_LOGS,
      Item: log
    }));
    
    return { rows: [log], rowCount: 1, insertId: log.id };
  }
  
  if (text.includes('UPDATE timesheet_logs')) {
    const id = parseInt(params[params.length - 1]);
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.TIMESHEET_LOGS,
      Key: { id },
      UpdateExpression: 'SET logout_time = :logout_time, logout_latitude = :logout_latitude, logout_longitude = :logout_longitude, #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':logout_time': params[0],
        ':logout_latitude': params[1],
        ':logout_longitude': params[2],
        ':status': params[3]
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    return { rows: [result.Attributes], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function mockQuery(text, params) {
  if (text.includes('SELECT') && text.includes('employees')) {
    if (text.includes('WHERE id =')) {
      const employee = mockEmployees.find(emp => emp.id == params[0]);
      return { rows: employee ? [employee] : [] };
    }
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
  
  // Mock timesheets operations
  if (text.includes('SELECT') && text.includes('timesheets') && !text.includes('timesheet_logs')) {
    return { rows: mockTimesheets };
  }
  
  if (text.includes('INSERT INTO timesheets')) {
    const timesheet = {
      id: Date.now(),
      employee_id: params[0], date: params[1], hours_worked: params[2], project: params[3], status: params[4]
    };
    mockTimesheets.push(timesheet);
    return { rows: [timesheet], rowCount: 1 };
  }
  
  if (text.includes('UPDATE timesheets')) {
    const id = params[params.length - 1];
    const index = mockTimesheets.findIndex(ts => ts.id == id);
    if (index !== -1) {
      mockTimesheets[index] = { ...mockTimesheets[index], employee_id: params[0], date: params[1], hours_worked: params[2], project: params[3], status: params[4] };
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
  
  // Mock timesheet logs operations
  if (text.includes('SELECT') && text.includes('timesheet_logs')) {
    if (text.includes('WHERE employee_id =')) {
      return { rows: mockTimesheetLogs.filter(log => log.employee_id == params[0]) };
    }
    return { rows: mockTimesheetLogs };
  }
  
  if (text.includes('INSERT INTO timesheet_logs')) {
    const log = {
      id: Date.now(),
      employee_id: params[0], login_time: params[1], login_latitude: params[2], login_longitude: params[3],
      phone_type: params[4], phone_number: params[5], status: params[6]
    };
    mockTimesheetLogs.push(log);
    return { rows: [log], rowCount: 1, insertId: log.id };
  }
  
  if (text.includes('UPDATE timesheet_logs')) {
    const id = params[params.length - 1];
    const index = mockTimesheetLogs.findIndex(log => log.id == id);
    if (index !== -1) {
      mockTimesheetLogs[index] = { ...mockTimesheetLogs[index], logout_time: params[0], logout_latitude: params[1], logout_longitude: params[2], status: params[3] };
      return { rows: [mockTimesheetLogs[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  
  return { rows: [], rowCount: 0 };
}

module.exports = { query, TABLES };