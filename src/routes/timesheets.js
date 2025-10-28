const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/timesheets - Get all timesheets
router.get('/', async (req, res) => {
  try {
    console.log('⏰ GET /api/timesheets - Fetching all timesheets');
    const result = await query('SELECT * FROM timesheets ORDER BY date DESC');
    console.log(`✅ Retrieved ${result.rows ? result.rows.length : result.length} timesheets`);
    res.json(result.rows || result);
  } catch (error) {
    console.error('❌ Error fetching timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// POST /api/timesheets - Create new timesheet
router.post('/', async (req, res) => {
  try {
    const { employee_id, date, hours_worked, project, status } = req.body;
    console.log('📝 POST /api/timesheets - Creating timesheet:', req.body);
    
    const result = await query(
      'INSERT INTO timesheets (employee_id, date, hours_worked, project, status) VALUES ($1, $2, $3, $4, $5)',
      [employee_id, date, hours_worked, project, status]
    );
    
    console.log('✅ Timesheet created successfully');
    res.status(201).json({ 
      id: result.insertId || Date.now(), 
      employee_id, date, hours_worked, project, status 
    });
  } catch (error) {
    console.error('❌ Error creating timesheet:', error);
    res.status(500).json({ error: 'Failed to create timesheet' });
  }
});

// PUT /api/timesheets/:id - Update timesheet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, date, hours_worked, project, status } = req.body;
    console.log(`✏️ PUT /api/timesheets/${id} - Updating timesheet:`, req.body);
    
    const result = await query(
      'UPDATE timesheets SET employee_id = $1, date = $2, hours_worked = $3, project = $4, status = $5 WHERE id = $6',
      [employee_id, date, hours_worked, project, status, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }
    
    console.log('✅ Timesheet updated successfully');
    res.json({ 
      id: parseInt(id), 
      employee_id, date, hours_worked, project, status 
    });
  } catch (error) {
    console.error('❌ Error updating timesheet:', error);
    res.status(500).json({ error: 'Failed to update timesheet' });
  }
});

// DELETE /api/timesheets/:id - Delete timesheet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/timesheets/${id} - Deleting timesheet`);
    
    const result = await query('DELETE FROM timesheets WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }
    
    console.log('✅ Timesheet deleted successfully');
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting timesheet:', error);
    res.status(500).json({ error: 'Failed to delete timesheet' });
  }
});

// POST /api/timesheets/login - Employee login with GPS
router.post('/login', async (req, res) => {
  try {
    const { employee_id, latitude, longitude, phone_type, phone_number } = req.body;
    const login_time = new Date().toISOString();
    
    console.log('🔐 POST /api/timesheets/login - Employee login:', {
      employee_id, latitude, longitude, phone_type, phone_number
    });
    
    const result = await query(
      `INSERT INTO timesheet_logs (employee_id, login_time, login_latitude, login_longitude, 
       phone_type, phone_number, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [employee_id, login_time, latitude, longitude, phone_type, phone_number, 'logged_in']
    );
    
    console.log('✅ Employee logged in successfully');
    res.status(201).json({ 
      id: result.insertId || Date.now(),
      employee_id,
      login_time,
      status: 'logged_in',
      location: { latitude, longitude }
    });
  } catch (error) {
    console.error('❌ Error logging in employee:', error);
    res.status(500).json({ error: 'Failed to log in employee' });
  }
});

// POST /api/timesheets/logout - Employee logout with GPS
router.post('/logout', async (req, res) => {
  try {
    const { employee_id, latitude, longitude } = req.body;
    const logout_time = new Date().toISOString();
    
    console.log('🔓 POST /api/timesheets/logout - Employee logout:', {
      employee_id, latitude, longitude
    });
    
    // Find the latest login record for this employee
    const loginRecord = await query(
      `SELECT * FROM timesheet_logs WHERE employee_id = $1 AND status = 'logged_in' 
       ORDER BY login_time DESC LIMIT 1`,
      [employee_id]
    );
    
    if (!loginRecord.rows || loginRecord.rows.length === 0) {
      return res.status(400).json({ error: 'No active login session found' });
    }
    
    const loginId = loginRecord.rows[0].id;
    
    // Update the record with logout information
    await query(
      `UPDATE timesheet_logs SET logout_time = $1, logout_latitude = $2, 
       logout_longitude = $3, status = $4 WHERE id = $5`,
      [logout_time, latitude, longitude, 'logged_out', loginId]
    );
    
    // Calculate hours worked
    const loginTime = new Date(loginRecord.rows[0].login_time);
    const logoutTime = new Date(logout_time);
    const hoursWorked = (logoutTime - loginTime) / (1000 * 60 * 60);
    
    console.log('✅ Employee logged out successfully');
    res.json({ 
      id: loginId,
      employee_id,
      logout_time,
      hours_worked: Math.round(hoursWorked * 100) / 100,
      status: 'logged_out',
      location: { latitude, longitude }
    });
  } catch (error) {
    console.error('❌ Error logging out employee:', error);
    res.status(500).json({ error: 'Failed to log out employee' });
  }
});

// GET /api/timesheets/logs/:employee_id - Get employee time logs
router.get('/logs/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    console.log(`📋 GET /api/timesheets/logs/${employee_id} - Fetching time logs`);
    
    const result = await query(
      `SELECT * FROM timesheet_logs WHERE employee_id = $1 
       ORDER BY login_time DESC`,
      [employee_id]
    );
    
    console.log(`✅ Retrieved ${result.rows ? result.rows.length : result.length} time logs`);
    res.json(result.rows || result);
  } catch (error) {
    console.error('❌ Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

module.exports = router;