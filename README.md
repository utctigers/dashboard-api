# Dashboard API - Aurora DSQL Backend

Backend API server for the Business Dashboard with Aurora DSQL integration.

## Features

- **Employee Management**: Full CRUD operations
- **Aurora DSQL**: Direct PostgreSQL connection to cluster `4vthvxld47txd4lmgqpjzagqki`
- **Mock Fallback**: Automatic fallback to mock data if Aurora DSQL unavailable
- **CORS Enabled**: Ready for Angular frontend integration

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Health Check
- `GET /health` - Server status and Aurora DSQL info

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
AURORA_ENDPOINT=4vthvxld47txd4lmgqpjzagqki.dsql.us-east-1.on.aws
AURORA_PORT=5432
AURORA_DATABASE=postgres
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

## Aurora DSQL Integration

- Connects to cluster `4vthvxld47txd4lmgqpjzagqki.dsql.us-east-1.on.aws`
- Uses PostgreSQL protocol
- Automatic fallback to mock data
- Connection pooling for performance