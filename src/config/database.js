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
  TIMESHEETS: `${TABLE_PREFIX}-timesheets`
};

// Mock data fallback
const mockEmployees = [
  { id: 1, name: 'John Smith', email: 'john@company.com', phone: '(555) 123-4567', department: 'Engineering', role: 'Senior', salary: 85000, start_date: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone: '(555) 234-5678', department: 'Marketing', role: 'Manager', salary: 95000, start_date: '2022-11-20', status: 'Active' },
  { id: 3, name: 'Mike Davis', email: 'mike@company.com', phone: '(555) 345-6789', department: 'Sales', role: 'Senior', salary: 78000, start_date: '2023-03-10', status: 'On Leave' },
  { id: 4, name: 'Lisa Wilson', email: 'lisa@company.com', phone: '(555) 456-7890', department: 'HR', role: 'Manager', salary: 92000, start_date: '2022-08-05', status: 'Active' }
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
  
  return { rows: [], rowCount: 0 };
}

module.exports = { query, TABLES };