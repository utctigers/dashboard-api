require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/timesheets', require('./routes/timesheets'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dashboard API Server Running',
    dynamodb: {
      region: process.env.AWS_REGION || 'us-east-1',
      tablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'dashboard'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Employees API: http://localhost:${PORT}/api/employees`);
  console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
  console.log(`⏰ Timesheets API: http://localhost:${PORT}/api/timesheets`);
});