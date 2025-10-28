const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'dashboard';

const tables = [
  {
    TableName: `${TABLE_PREFIX}-employees`,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: `${TABLE_PREFIX}-inventory`,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: `${TABLE_PREFIX}-timesheets`,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: `${TABLE_PREFIX}-timesheet-logs`,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

const sampleData = {
  employees: [
    { id: 1, name: 'John Smith', email: 'john@company.com', phone: '(555) 123-4567', department: 'Engineering', role: 'Senior', salary: 85000, start_date: '2023-01-15', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', phone: '(555) 234-5678', department: 'Marketing', role: 'Manager', salary: 95000, start_date: '2022-11-20', status: 'Active' }
  ],
  inventory: [
    { id: 1, name: 'Office Chairs', sku: 'OFC-001', category: 'Furniture', stock: 15, min_stock: 10, max_stock: 50, price: 299.99 },
    { id: 2, name: 'Laptops', sku: 'LTP-002', category: 'Electronics', stock: 5, min_stock: 8, max_stock: 25, price: 1299.99 }
  ],
  timesheets: [
    { id: 1, employee_id: 1, date: '2024-01-15', hours_worked: 8, project: 'Website Development', status: 'Approved' }
  ],
  'timesheet-logs': [
    { id: 1, employee_id: 1, login_time: '2024-01-15T09:00:00Z', logout_time: '2024-01-15T17:00:00Z', login_latitude: 40.7128, login_longitude: -74.0060, logout_latitude: 40.7128, logout_longitude: -74.0060, phone_type: 'iPhone', phone_number: '555-0123', status: 'logged_out' }
  ]
};

async function createTables() {
  console.log('🔧 Creating DynamoDB tables...');
  
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️  Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, error.message);
      }
    }
  }
  
  console.log('📝 Adding sample data...');
  await addSampleData();
  console.log('🎉 DynamoDB setup complete!');
}

async function addSampleData() {
  for (const [tableType, items] of Object.entries(sampleData)) {
    const tableName = `${TABLE_PREFIX}-${tableType}`;
    
    for (const item of items) {
      try {
        await docClient.send(new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(id)'
        }));
        console.log(`✅ Added ${tableType} record: ${item.name || item.id}`);
      } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
          console.log(`⚠️  Record already exists: ${item.name || item.id}`);
        } else {
          console.error(`❌ Error adding ${tableType} record:`, error.message);
        }
      }
    }
  }
}

createTables().catch(console.error);