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
      'INSERT INTO timesheets (employee_id, date, hours_worked, project, status) VALUES (?, ?, ?, ?, ?)',
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
      'UPDATE timesheets SET employee_id = ?, date = ?, hours_worked = ?, project = ?, status = ? WHERE id = ?',
      [employee_id, date, hours_worked, project, status, id]
    );
    
    if (result.affectedRows === 0) {
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
    
    const result = await query('DELETE FROM timesheets WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }
    
    console.log('✅ Timesheet deleted successfully');
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting timesheet:', error);
    res.status(500).json({ error: 'Failed to delete timesheet' });
  }
});

module.exports = router;