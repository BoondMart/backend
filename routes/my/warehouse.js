const express = require('express');
const router = express.Router();
const Warehouse = require('../my/warehousem');

// **CREATE**: Add a new warehouse
router.post('/', async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    const savedWarehouse = await warehouse.save();
    res.status(201).json(savedWarehouse);
  } catch (error) {
    res.status(400).json({ message: 'Error creating warehouse', error: error.message });
  }
});

// **READ ALL**: Get all warehouses
router.get('/', async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error: error.message });
  }
});

// **READ ONE**: Get a warehouse by ID
router.get('/:id', async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouse', error: error.message });
  }
});

// **UPDATE**: Update a warehouse by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWarehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.status(200).json(updatedWarehouse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating warehouse', error: error.message });
  }
});

// **DELETE**: Delete a warehouse by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedWarehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!deletedWarehouse) return res.status(404).json({ message: 'Warehouse not found' });
    res.status(200).json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting warehouse', error: error.message });
  }
});

module.exports = router;
