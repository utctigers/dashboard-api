import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';

test.describe('Inventory API', () => {
  let itemId: number;

  test('GET /api/inventory - should fetch all inventory items', async ({ request }) => {
    const response = await request.get(`${API_BASE}/inventory`);
    expect(response.status()).toBe(200);
    
    const items = await response.json();
    expect(Array.isArray(items)).toBe(true);
  });

  test('POST /api/inventory - should create new item', async ({ request }) => {
    const newItem = {
      name: 'Test Item',
      sku: 'TEST-001',
      category: 'Electronics',
      stock: 10,
      min_stock: 5,
      max_stock: 50,
      price: 99.99
    };

    const response = await request.post(`${API_BASE}/inventory`, {
      data: newItem
    });
    
    expect(response.status()).toBe(201);
    const item = await response.json();
    expect(item.name).toBe(newItem.name);
    expect(item.sku).toBe(newItem.sku);
    
    itemId = item.id;
  });

  test('PUT /api/inventory/:id - should update item', async ({ request }) => {
    const updatedData = {
      name: 'Updated Item',
      sku: 'UPD-001',
      category: 'Furniture',
      stock: 15,
      min_stock: 8,
      max_stock: 60,
      price: 149.99
    };

    const response = await request.put(`${API_BASE}/inventory/${itemId}`, {
      data: updatedData
    });
    
    expect(response.status()).toBe(200);
    const item = await response.json();
    expect(item.name).toBe(updatedData.name);
    expect(item.price).toBe(updatedData.price);
  });

  test('PUT /api/inventory/:id/reorder - should reorder item', async ({ request }) => {
    const response = await request.put(`${API_BASE}/inventory/${itemId}/reorder`);
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.message).toContain('reordered');
  });

  test('DELETE /api/inventory/:id - should delete item', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/inventory/${itemId}`);
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result.message).toContain('deleted');
  });
});