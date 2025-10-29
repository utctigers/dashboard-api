# WORKING API TO ILLUSTRATE THE E2E PLAYWRIGHT TESTS FOR API'S


# Dashboard API - DynamoDB Backend

Backend API server for the Business Dashboard with DynamoDB integration.

## Features

- **Employee Management**: Full CRUD operations with retry logic
- **DynamoDB**: NoSQL database with consistent reads and automatic scaling
- **Mock Fallback**: Automatic fallback to mock data if DynamoDB unavailable
- **CORS Enabled**: Ready for Angular frontend integration
- **E2E Testing**: Playwright tests with DynamoDB consistency handling

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID (with consistent reads)
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Timesheets
- `GET /api/timesheets` - Get all timesheets
- `POST /api/timesheets` - Create new timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `DELETE /api/timesheets/:id` - Delete timesheet
- `POST /api/timesheets/login` - Employee login with location
- `POST /api/timesheets/logout` - Employee logout with hours calculation
- `GET /api/timesheets/logs/:employee_id` - Get employee time logs

### Health Check
- `GET /health` - Server status and DynamoDB info

## Quick Start

```bash
# Install dependencies
npm install

# Set up DynamoDB tables
npm run setup:dynamodb

# Start development server
npm run dev

# Start production server
npm start

# Run E2E tests
npm run test:api
```

## Environment Variables

```env
DYNAMODB_TABLE_PREFIX=dashboard
AWS_REGION=us-east-1
PORT=3001
```

## Usage

Server runs on `http://localhost:3001`

Test endpoints:
```bash
# Health check
curl http://localhost:3001/health

# Get employees
curl http://localhost:3001/api/employees

# Create employee
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@company.com","department":"IT","role":"Developer","salary":75000}'
```

## DynamoDB Integration

- **Consistent Reads**: Enabled for immediate data consistency
- **Pay-per-Request**: No capacity planning required
- **Retry Logic**: Built-in retry mechanism for consistency issues
- **Mock Fallback**: Automatic fallback during development
- **Tables**: `dashboard-employees`, `dashboard-inventory`, `dashboard-timesheets`

## Testing

- **Playwright E2E Tests**: Full API testing suite
- **Retry Mechanism**: Handles DynamoDB eventual consistency
- **Mock Data Support**: Tests work with or without real DynamoDB
- **Comprehensive Coverage**: All CRUD operations tested
