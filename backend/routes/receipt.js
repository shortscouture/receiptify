const express = require('express');
const { body } = require('express-validator');
const { createReceipt, listReceipts } = require('../controllers/receiptController');

const router = express.Router();

router.get('/', listReceipts);

router.post(
  '/insert',
  [
    body('userId')
      .isInt({ gt: 0 })
      .withMessage('User ID must be a positive integer')
      .toInt(),
    body('datetime')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Datetime must be a valid ISO8601 date string')
      .toDate(),
    body('merchant')
      .trim()
      .notEmpty()
      .withMessage('Merchant is required'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a non-negative number')
      .toFloat(),
    body('sourceEmail')
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .withMessage('Source email must be a valid email address')
      .normalizeEmail()
  ],
  createReceipt
);

module.exports = router;
