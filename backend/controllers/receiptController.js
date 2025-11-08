const { validationResult } = require('express-validator');
const { models } = require('../models');

const createReceipt = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payload = {
      userId: req.body.userId,
      merchant: req.body.merchant,
      category: req.body.category,
      amount: req.body.amount,
      sourceEmail: req.body.sourceEmail ?? null
    };

    if (req.body.datetime) {
      payload.datetime = req.body.datetime;
    }

    const receipt = await models.Receipt.create(payload);

    return res.status(201).json({ receipt: receipt.toJSON() });
  } catch (error) {
    console.error('Failed to create receipt:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid receipt data', details: error.errors || error.message });
    }

    return res.status(500).json({ error: 'Failed to create receipt' });
  }
};

const listReceipts = async (_req, res) => {
  try {
    const receipts = await models.Receipt.findAll({
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ receipts: receipts.map((receipt) => receipt.toJSON()) });
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return res.status(500).json({ error: 'Failed to fetch receipts' });
  }
};

module.exports = {
  createReceipt,
  listReceipts
};
