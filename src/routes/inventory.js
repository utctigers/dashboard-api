const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/inventory - Get all inventory items
router.get('/', async (req, res) => {
  try {
    console.log('📦 GET /api/inventory - Fetching all inventory items');
    const result = await query('SELECT * FROM inventory ORDER BY id');
    console.log(`✅ Retrieved ${result.rows ? result.rows.length : result.length} inventory items`);
    res.json(result.rows || result);
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// POST /api/inventory - Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, stock, min_stock, max_stock, price } = req.body;
    console.log('📝 POST /api/inventory - Creating inventory item:', req.body);
    
    const result = await query(
      'INSERT INTO inventory (name, sku, category, stock, min_stock, max_stock, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, stock, min_stock, max_stock, price]
    );
    
    console.log('✅ Inventory item created successfully');
    res.status(201).json({ 
      id: result.insertId || Date.now(), 
      name, sku, category, stock, min_stock, max_stock, price 
    });
  } catch (error) {
    console.error('❌ Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category, stock, min_stock, max_stock, price } = req.body;
    console.log(`✏️ PUT /api/inventory/${id} - Updating inventory item:`, req.body);
    
    const result = await query(
      'UPDATE inventory SET name = ?, sku = ?, category = ?, stock = ?, min_stock = ?, max_stock = ?, price = ? WHERE id = ?',
      [name, sku, category, stock, min_stock, max_stock, price, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    console.log('✅ Inventory item updated successfully');
    res.json({ 
      id: parseInt(id), 
      name, sku, category, stock, min_stock, max_stock, price 
    });
  } catch (error) {
    console.error('❌ Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// PUT /api/inventory/:id/reorder - Reorder inventory item to max stock
router.put('/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { maxStock } = req.body;
    console.log(`🔄 PUT /api/inventory/${id}/reorder - Reordering to max stock:`, maxStock);
    
    const result = await query(
      'UPDATE inventory SET stock = ? WHERE id = ?',
      [maxStock, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    console.log('✅ Inventory item reordered successfully');
    res.json({ message: 'Item reordered successfully', newStock: maxStock });
  } catch (error) {
    console.error('❌ Error reordering inventory item:', error);
    res.status(500).json({ error: 'Failed to reorder inventory item' });
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/inventory/${id} - Deleting inventory item`);
    
    const result = await query('DELETE FROM inventory WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    console.log('✅ Inventory item deleted successfully');
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 GET /api/inventory/stats - Fetching inventory statistics');
    const result = await query('SELECT * FROM inventory');
    const items = result.rows || result;
    
    const stats = {
      totalItems: items.length,
      lowStockItems: items.filter(item => item.stock <= item.min_stock).length,
      outOfStockItems: items.filter(item => item.stock === 0).length,
      totalValue: items.reduce((sum, item) => sum + (item.stock * item.price), 0)
    };
    
    console.log('✅ Inventory statistics calculated');
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching inventory statistics:', error);
    res.status(500).json({ error: 'Failed to fetch inventory statistics' });
  }
});

module.exports = router;