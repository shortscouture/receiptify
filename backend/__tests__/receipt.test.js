'use strict';

process.env.NODE_ENV = 'test';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const { sequelize, initializeModels, models } = require('../models');
const app = require('../server');

const dbPath = path.resolve(__dirname, '..', 'data', 'database.test.sqlite');

describe('Receipts API', () => {
  let testUser;

  beforeAll(async () => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    initializeModels();
    await sequelize.sync({ force: true });

    testUser = await models.User.create({
      name: 'Receipt User',
      email: 'receipt.user@example.com',
      password: 'testpassword'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await models.Receipt.destroy({ where: {} });
  });

  describe('POST /receipts/insert', () => {
    it('creates a receipt when payload is valid', async () => {
      const payload = {
        userId: testUser.id,
        datetime: '2025-01-01T12:00:00.000Z',
        merchant: 'Test Merchant',
        category: 'Groceries',
        amount: 99.99,
        sourceEmail: 'receipts@example.com'
      };

      const res = await request(app).post('/receipts/insert').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('receipt');
      expect(res.body.receipt).toEqual(
        expect.objectContaining({
          userId: testUser.id,
          merchant: 'Test Merchant',
          category: 'Groceries',
          amount: 99.99,
          sourceEmail: 'receipts@example.com'
        })
      );
      expect(res.body.receipt).toHaveProperty('id');
    });

    it('creates a receipt using default datetime when none provided', async () => {
      const payload = {
        userId: testUser.id,
        merchant: 'Default Merchant',
        category: 'Utilities',
        amount: 45.5
      };

      const res = await request(app).post('/receipts/insert').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.receipt).toHaveProperty('id');
      expect(res.body.receipt.datetime).toBeTruthy();
    });

    it('rejects invalid input with validation errors', async () => {
      const payload = {
        userId: 'not-a-number',
        merchant: '',
        category: '',
        amount: -10
      };

      const res = await request(app).post('/receipts/insert').send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /receipts', () => {
    it('returns all receipts in descending creation order', async () => {
      const firstPayload = {
        userId: testUser.id,
        merchant: 'First Merchant',
        category: 'Dining',
        amount: 20.5,
        datetime: '2025-02-01T10:00:00.000Z'
      };

      const secondPayload = {
        userId: testUser.id,
        merchant: 'Second Merchant',
        category: 'Travel',
        amount: 150.75,
        datetime: '2025-02-02T15:30:00.000Z'
      };

      await request(app).post('/receipts/insert').send(firstPayload);
      await request(app).post('/receipts/insert').send(secondPayload);

      const res = await request(app).get('/receipts');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('receipts');
      expect(Array.isArray(res.body.receipts)).toBe(true);
      expect(res.body.receipts.length).toBe(2);
      expect(res.body.receipts[0].merchant).toBe('Second Merchant');
      expect(res.body.receipts[1].merchant).toBe('First Merchant');
    });

    it('returns an empty array when no receipts exist', async () => {
      // Clean up receipts and ensure table is empty
      await models.Receipt.destroy({ where: {} });

      const res = await request(app).get('/receipts');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('receipts');
      expect(res.body.receipts).toEqual([]);
    });
  });
});
