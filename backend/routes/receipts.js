const express = require('express');
const { models } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const receiptVisionService = require('../services/receiptVisionService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.RECEIPT_UPLOAD_MAX_BYTES || `${5 * 1024 * 1024}`, 10)
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

/**
 * GET /api/receipts
 * Get all receipts for the authenticated user
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, dateFrom, dateTo, limit = 100 } = req.query;
    
    const Receipt = models.Receipt;
    
    // Build query conditions
    const where = { userId };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (dateFrom || dateTo) {
      where.datetime = {};
      if (dateFrom) {
        where.datetime[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.datetime[Op.lte] = new Date(dateTo);
      }
    }
    
    const receipts = await Receipt.findAll({
      where,
      order: [['datetime', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      count: receipts.length,
      receipts
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch receipts',
      details: error.message 
    });
  }
});

/**
 * POST /api/receipts/parse/image
 * Extract receipt fields from an uploaded image via Gemini
 */
router.post('/parse/image', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!receiptVisionService.isConfigured) {
      return res.status(503).json({ error: 'Gemini integration is not configured' });
    }

    const result = await receiptVisionService.extractFromImage(
      req.file.buffer,
      req.file.mimetype
    );

    res.json({
      success: true,
      extracted: result,
      source: {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error parsing receipt image:', error);
    const message = error?.message || '';
    const status = message.includes('not valid JSON') || message.includes('provide')
      ? 422
      : 500;

    res.status(status).json({
      error: 'Failed to parse receipt image',
      details: message
    });
  }
});

/**
 * GET /api/receipts/:id
 * Get a specific receipt by ID
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const receiptId = req.params.id;
    const Receipt = models.Receipt;
    
    const receipt = await Receipt.findOne({
      where: { id: receiptId, userId }
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ success: true, receipt });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ 
      error: 'Failed to fetch receipt',
      details: error.message 
    });
  }
});

/**
 * POST /api/receipts
 * Create a new receipt manually
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { datetime, merchant, category, amount, currency, notes } = req.body;
    
    // Validation
    if (!datetime || !merchant || !category || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: datetime, merchant, category, amount' 
      });
    }
    
    const Receipt = models.Receipt;
    
    const receipt = await Receipt.create({
      userId,
      datetime: new Date(datetime),
      merchant,
      category,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      notes,
      status: 'processed'
    });
    
    res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      receipt
    });
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ 
      error: 'Failed to create receipt',
      details: error.message 
    });
  }
});

/**
 * PUT /api/receipts/:id
 * Update a receipt
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const receiptId = req.params.id;
    const { datetime, merchant, category, amount, currency, notes, status } = req.body;
    
    const Receipt = models.Receipt;
    
    const receipt = await Receipt.findOne({
      where: { id: receiptId, userId }
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    // Update fields
    if (datetime) receipt.datetime = new Date(datetime);
    if (merchant) receipt.merchant = merchant;
    if (category) receipt.category = category;
    if (amount) receipt.amount = parseFloat(amount);
    if (currency) receipt.currency = currency;
    if (notes !== undefined) receipt.notes = notes;
    if (status) receipt.status = status;
    
    await receipt.save();
    
    res.json({
      success: true,
      message: 'Receipt updated successfully',
      receipt
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).json({ 
      error: 'Failed to update receipt',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/receipts/:id
 * Delete a receipt
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const receiptId = req.params.id;
    
    const Receipt = models.Receipt;
    
    const receipt = await Receipt.findOne({
      where: { id: receiptId, userId }
    });
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    await receipt.destroy();
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ 
      error: 'Failed to delete receipt',
      details: error.message 
    });
  }
});

/**
 * GET /api/receipts/stats/summary
 * Get spending statistics
 */
router.get('/stats/summary', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const Receipt = models.Receipt;
    
    // Total spending
    const totalResult = await Receipt.sum('amount', { where: { userId } });
    const total = totalResult || 0;
    
    // This month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthResult = await Receipt.sum('amount', {
      where: {
        userId,
        datetime: { [Op.gte]: firstDayOfMonth }
      }
    });
    const thisMonth = thisMonthResult || 0;
    
    // Count
    const count = await Receipt.count({ where: { userId } });
    
    // By category
    const byCategory = await Receipt.findAll({
      where: { userId },
      attributes: [
        'category',
        [models.sequelize.fn('SUM', models.sequelize.col('amount')), 'total'],
        [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
      ],
      group: ['category']
    });
    
    res.json({
      success: true,
      stats: {
        total: parseFloat(total).toFixed(2),
        thisMonth: parseFloat(thisMonth).toFixed(2),
        count,
        byCategory
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

module.exports = router;
