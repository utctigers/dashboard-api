import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';

test.describe('Timesheets API', () => {
  let timesheetId: number;
  let employeeId = 1;

  test('GET /api/timesheets - should fetch all timesheets', async ({ request }) => {
    const response = await request.get(`${API_BASE}/timesheets`);
    expect(response.status()).toBe(200);
    
    const timesheets = await response.json();
    expect(Array.isArray(timesheets)).toBe(true);
  });

  test('POST /api/timesheets - should create new timesheet', async ({ request }) => {
    const newTimesheet = {
      employee_id: employeeId,
      date: '2024-01-20',
      hours_worked: 8,
      project: 'Test Project',
      status: 'Submitted'
    };

    const response = await request.post(`${API_BASE}/timesheets`, {
      data: newTimesheet
    });
    
    expect(response.status()).toBe(201);
    const timesheet = await response.json();
    expect(timesheet.employee_id).toBe(newTimesheet.employee_id);
    expect(timesheet.project).toBe(newTimesheet.project);
    
    timesheetId = timesheet.id;
  });

  test('POST /api/timesheets/login - should log employee in', async ({ request }) => {
    const loginData = {
      employee_id: employeeId,
      latitude: 40.7128,
      longitude: -74.0060,
      phone_type: 'iPhone',
      phone_number: '555-0123'
    };

    const response = await request.post(`${API_BASE}/timesheets/login`, {
      data: loginData
    });
    
    expect(response.status()).toBe(201);
    const result = await response.json();
    expect(result.employee_id).toBe(employeeId);
    expect(result.status).toBe('logged_in');
  });

  test('POST /api/timesheets/logout - should log employee out', async ({ request }) => {
    console.log('Logging out employee with ID:', employeeId);
    const logoutData = {
      employee_id: employeeId,
      latitude: 40.7128,
      longitude: -74.0060
    };
    console.log('Logout data:', logoutData);
    const response = await request.post(`${API_BASE}/timesheets/logout`, {
      data: logoutData
    });
    
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.employee_id).toBe(employeeId);
    expect(result.status).toBe('logged_out');
    expect(result.hours_worked).toBeGreaterThan(0);
  });

  test('GET /api/timesheets/logs/:employee_id - should fetch employee logs', async ({ request }) => {
    const response = await request.get(`${API_BASE}/timesheets/logs/${employeeId}`);
    expect(response.status()).toBe(200);
    
    const logs = await response.json();
    expect(Array.isArray(logs)).toBe(true);
  });

  test('PUT /api/timesheets/:id - should update timesheet', async ({ request }) => {
    const updatedData = {
      date: '2024-01-20',
      hours_worked: 7.5,
      project: 'Updated Project',
      status: 'Approved'
    };
    console.log('Updating timesheet with ID:', timesheetId);
    const response = await request.put(`${API_BASE}/timesheets/${timesheetId}`, {
      data: updatedData
    });
    console.log('Update response status:', response);
    expect(response.status()).toBe(200);
    const timesheet = await response.json();
    expect(timesheet.hours_worked).toBe(updatedData.hours_worked);
    expect(timesheet.status).toBe(updatedData.status);
  });

  test('DELETE /api/timesheets/:id - should delete timesheet', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/timesheets/${timesheetId}`);
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.message).toContain('deleted');
  });
});