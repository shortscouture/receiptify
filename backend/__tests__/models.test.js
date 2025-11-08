'use strict';

process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'data', 'database.test.sqlite');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = require('../models');

describe('Sequelize models', () => {
  beforeAll(async () => {
    db.initializeModels();
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('creates a user and associated receipt', async () => {
    const { User, Receipt } = db.models;

    const user = await User.create({
      name: 'Alice Testing',
      email: 'alice@example.com',
      password: 'supersecret'
    });

    const receipt = await Receipt.create({
      userId: user.id,
      datetime: new Date('2024-01-01T12:00:00Z'),
      merchant: 'Test Market',
      category: 'Groceries',
      amount: 42.5,
      sourceEmail: 'receipts@test.com'
    });

    const receipts = await user.getReceipts();

    expect(receipts).toHaveLength(1);
    expect(receipts[0].id).toBe(receipt.id);
    expect(receipts[0].userId).toBe(user.id);
  });
});
