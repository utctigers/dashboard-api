# Dashboard API - DynamoDB Backend

Backend API server for the Business Dashboard with DynamoDB integration.

## Features

- **Employee Management**: Full CRUD operations
- **DynamoDB**: NoSQL database with automatic scaling
- **Mock Fallback**: Automatic fallback to mock data if DynamoDB unavailable
- **CORS Enabled**: Ready for Angular frontend integration

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Health Check
- `GET /health` - Server status and DynamoDB info

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
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

- Uses AWS DynamoDB for data storage
- NoSQL document-based storage
- Automatic fallback to mock data
- Serverless and scalable