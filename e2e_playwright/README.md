# E2E Playwright Tests

End-to-end tests for the Dashboard API using Playwright.

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

## Prerequisites

- Dashboard API server configured in parent directory
- Node.js and npm installed

## Test Commands

- `npm test` - Run all tests headlessly
- `npm run test:headed` - Run tests with browser visible
- `npm run test:ui` - Interactive Playwright UI
- `npm run test:debug` - Debug mode

Tests automatically start the API server on port 3001 before running.