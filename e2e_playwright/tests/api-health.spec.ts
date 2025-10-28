import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';

test.describe('API Health Checks', () => {
  test('API server should be running', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`);
    expect(response.status()).not.toBe(404);
  });

  test('should handle CORS headers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`);
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  test('should return JSON content type', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should handle invalid endpoints gracefully', async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test('should validate required fields on POST', async ({ request }) => {
    const response = await request.post(`${API_BASE}/employees`, {
      data: {}
    });
    expect(response.status()).toBe(400);
  });

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post(`${API_BASE}/employees`, {
      data: 'invalid json',
      headers: {
        'content-type': 'application/json'
      }
    });
    expect(response.status()).toBe(400);
  });
});