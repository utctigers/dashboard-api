# E2E Playwright Tests

End-to-end tests for the Dashboard API using Playwright with DynamoDB support.

## Features

- **DynamoDB Testing**: Tests work with real DynamoDB or mock data
- **Retry Logic**: Handles DynamoDB eventual consistency automatically
- **Auto Server Start**: Automatically starts API server before tests
- **Comprehensive Coverage**: Tests all CRUD operations

## Quick Start

```bash
# Install dependencies
npm install

# Run tests (auto-starts server)
npm test

# Run with browser UI
npm run test:headed

# Interactive test mode
npm run test:ui
```

## Test Suites

- **employees.api.spec.ts** - Employee CRUD operations with retry logic
- **inventory.api.spec.ts** - Inventory management tests
- **timesheets.api.spec.ts** - Timesheet and time tracking tests
- **api-health.spec.ts** - Health check and server status

## Prerequisites

- Dashboard API server configured in parent directory
- DynamoDB tables created (optional - falls back to mock data)
- Node.js and npm installed

## Test Commands

- `npm test` - Run all tests headlessly
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Interactive Playwright UI
- `npm run test:debug` - Debug mode

## DynamoDB Consistency Handling

Tests include retry mechanisms to handle DynamoDB's eventual consistency:
- **Exponential backoff** for failed requests
- **Consistent reads** for GET operations
- **Automatic retries** up to 3 attempts
- **Unique identifiers** to avoid conflicts

Tests automatically start the API server on port 3001 before running.