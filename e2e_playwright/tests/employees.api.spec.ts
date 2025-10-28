import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';

async function retryRequest(requestFn: () => Promise<any>, maxRetries = 3, delay = 200) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

test.describe('Employees API', () => {
  let employeeId: number;

  test('GET /api/employees - should fetch all employees', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`);
    expect(response.status()).toBe(200);
    
    const employees = await response.json();
    expect(Array.isArray(employees)).toBe(true);
  });

  test('POST /api/employees - should create new employee', async ({ request }) => {
    const newEmployee = {
      name: 'Test Employee',
      email: `test-${Date.now()}@example.com`,
      phone: '555-0123',
      department: 'Engineering',
      role: 'Developer',
      salary: 75000,
      start_date: '2024-01-01',
      status: 'Active'
    };

    const response = await request.post(`${API_BASE}/employees`, {
      data: newEmployee
    });
    
    expect(response.status()).toBe(201);
    const employee = await response.json();
    expect(employee.name).toBe(newEmployee.name);
    expect(employee.email).toBe(newEmployee.email);
    expect(typeof employee.id).toBe('number');
    
    employeeId = employee.id;
  });

  test('GET /api/employees/:id - should fetch employee by ID', async ({ request }) => {
    const response = await retryRequest(async () => {
      const res = await request.get(`${API_BASE}/employees/${employeeId}`);
      if (res.status() !== 200) {
        throw new Error(`Expected 200, got ${res.status()}`);
      }
      const employee = await res.json();
      if (employee.id !== employeeId) {
        throw new Error('Employee not found or ID mismatch');
      }
      return { response: res, employee };
    });
    
    expect(response.response.status()).toBe(200);
    expect(response.employee.id).toBe(employeeId);
    expect(response.employee.name).toBe('Test Employee');
  });

  test('PUT /api/employees/:id - should update employee', async ({ request }) => {
    const updatedData = {
      name: 'Updated Employee',
      email: `updated-${Date.now()}@example.com`,
      phone: '864-555-9999',
      department: 'Marketing',
      role: 'Manager',
      salary: 85000,
      start_date: '2024-01-01',
      status: 'Active'
    };

    const response = await retryRequest(async () => {
      const res = await request.put(`${API_BASE}/employees/${employeeId}`, {
        data: updatedData
      });
      if (res.status() !== 200) {
        throw new Error(`Expected 200, got ${res.status()}`);
      }
      return res;
    });
    
    expect(response.status()).toBe(200);
    const employee = await response.json();
    expect(employee.name).toBe(updatedData.name);
    expect(employee.email).toBe(updatedData.email);
  });

  test('DELETE /api/employees/:id - should delete employee', async ({ request }) => {
    const response = await retryRequest(async () => {
      const res = await request.delete(`${API_BASE}/employees/${employeeId}`);
      if (res.status() !== 200) {
        throw new Error(`Expected 200, got ${res.status()}`);
      }
      return res;
    });
    
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.message).toContain('deleted');
  });
});