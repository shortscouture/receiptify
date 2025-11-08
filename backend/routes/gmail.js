const express = require('express');
const gmailService = require('../services/gmailService');
const receiptProcessor = require('../services/receiptProcessor');
const { models } = require('../models');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

/**
 * GET /api/gmail/sync
 * Sync recent emails and process receipts
 */
router.post('/sync', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { daysBack = 7 } = req.body;

    console.log(`Starting email sync for user ${userId}`);
    
    const results = await receiptProcessor.processRecentEmails(userId, daysBack);
    
    const successCount = results.filter(r => !r.error).length;
    const failedCount = results.filter(r => r.error).length;

    res.json({
      message: 'Email sync completed',
      total: results.length,
      success: successCount,
      failed: failedCount,
      receipts: results.filter(r => !r.error)
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync emails',
      details: error.message 
    });
  }
});

/**
 * POST /api/gmail/process-all
 * Process all receipt emails (up to maxEmails)
 */
router.post('/process-all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxEmails = 50 } = req.body;

    console.log(`Processing all emails for user ${userId}`);
    
    const results = await receiptProcessor.processAllEmails(userId, maxEmails);
    
    const successCount = results.filter(r => !r.error).length;
    const failedCount = results.filter(r => r.error).length;

    res.json({
      message: 'All emails processed',
      total: results.length,
      success: successCount,
      failed: failedCount,
      receipts: results.filter(r => !r.error)
    });
  } catch (error) {
    console.error('Process all error:', error);
    res.status(500).json({ 
      error: 'Failed to process emails',
      details: error.message 
    });
  }
});

/**
 * GET /api/gmail/search
 * Search for emails with custom query
 */
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query = 'label:receipts', maxResults = 10 } = req.query;

    const emails = await gmailService.searchEmails(userId, query, parseInt(maxResults));
    
    res.json({
      count: emails.length,
      emails: emails
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search emails',
      details: error.message 
    });
  }
});

/**
 * GET /api/gmail/email/:id
 * Get specific email details
 */
router.get('/email/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;

    const email = await gmailService.getEmail(userId, emailId);
    
    res.json(email);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ 
      error: 'Failed to get email',
      details: error.message 
    });
  }
});

/**
 * POST /api/gmail/process-email/:id
 * Process a specific email
 */
router.post('/process-email/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;

    const receipt = await receiptProcessor.processEmail(userId, emailId);
    
    res.json({
      message: 'Email processed successfully',
      receipt
    });
  } catch (error) {
    console.error('Process email error:', error);
    res.status(500).json({ 
      error: 'Failed to process email',
      details: error.message 
    });
  }
});

/**
 * GET /api/gmail/status
 * Check Gmail connection status
 */
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const UserToken = models.UserToken;
    
    const token = await UserToken.findOne({ where: { userId } });
    
    if (!token) {
      return res.json({ 
        connected: false,
        message: 'Gmail not connected. Please authorize Gmail access.'
      });
    }

    const isExpired = token.expiryDate && new Date(token.expiryDate) < new Date();
    
    res.json({
      connected: true,
      expired: isExpired,
      scopes: token.scope ? token.scope.split(' ') : [],
      expiryDate: token.expiryDate
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      details: error.message 
    });
  }
});

module.exports = router;
