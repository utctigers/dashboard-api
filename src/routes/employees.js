const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/employees/stats - Get employee statistics (must be before /:id routes)
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employees');
    const employees = result.rows;
    
    const stats = {
      total: employees.length,
      active: employees.filter(emp => emp.status === 'Active').length,
      departments: employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {}),
      avgSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ error: 'Failed to fetch employee statistics' });
  }
});

// GET /api/employees - Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }
    
    const result = await db.query('SELECT * FROM employees WHERE id = $1', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});


// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, role, salary, start_date, status } = req.body;
    
    const result = await db.query(
      'INSERT INTO employees (name, email, phone, department, role, salary, start_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, email, phone, department, role, salary, start_date, status || 'Active']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, role, salary, start_date, status } = req.body;
    
    const result = await db.query(
      'UPDATE employees SET name = $1, email = $2, phone = $3, department = $4, role = $5, salary = $6, start_date = $7, status = $8 WHERE id = $9 RETURNING *',
      [name, email, phone, department, role, salary, start_date, status, id]
    );
    console.log('Update Result:', result);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM employees WHERE id = $1', [id]);
    console.log('Delete Result:', result);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;