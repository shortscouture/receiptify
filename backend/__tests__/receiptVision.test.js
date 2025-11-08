const request = require('supertest');
const express = require('express');

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

const receiptVisionService = require('../services/receiptVisionService');
const receiptsRouter = require('../routes/receipts');

const buildApp = () => {
  const app = express();
  app.use((req, _res, next) => {
    req.isAuthenticated = () => true;
    req.user = { id: 1 };
    next();
  });
  app.use('/api/receipts', receiptsRouter);
  return app;
};

describe('ReceiptVisionService', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    receiptVisionService._model = null;
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    jest.clearAllMocks();
  });

  it('parses a valid Gemini response and normalizes values', async () => {
    const responsePayload = {
      datetime: '2024-05-01T12:00:00Z',
      merchant: 'Test Store',
      category: 'dining',
      amount: '45.32',
      currency: 'usd',
      notes: 'Lunch with client',
      confidence: 'HIGH',
      items: [
        { description: 'Burger', quantity: 1, price: '12.00', total: '12.00' },
        { description: 'Fries', quantity: '1', price: '5.00', total: '5.00' }
      ],
      tax: '3.20',
      tip: '5.00'
    };

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(responsePayload)
      }
    });

    const buffer = Buffer.from('fake-image');
    const result = await receiptVisionService.extractFromImage(buffer, 'image/jpeg');

  expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      datetime: '2024-05-01T12:00:00.000Z',
      merchant: 'Test Store',
      category: 'dining',
      amount: 45.32,
      currency: 'USD',
      notes: 'Lunch with client',
      confidence: 'high',
      items: [
        {
          description: 'Burger',
          quantity: 1,
          price: '12.00',
          total: '12.00'
        },
        {
          description: 'Fries',
          quantity: 1,
          price: '5.00',
          total: '5.00'
        }
      ],
      tax: 3.2,
      tip: 5
    });
  });

  it('throws when Gemini omits required merchant data', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          datetime: '2024-05-01',
          category: 'dining',
          amount: '12.00',
          currency: 'USD'
        })
      }
    });

    await expect(
      receiptVisionService.extractFromImage(Buffer.from('fake'), 'image/png')
    ).rejects.toThrow('Gemini did not provide a merchant name');
  });
});

describe('POST /api/receipts/parse/image', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
    jest.clearAllMocks();
  });

  it('returns parsed data when upload succeeds', async () => {
    const mockResult = {
      datetime: '2024-05-01T12:00:00.000Z',
      merchant: 'Demo Mart',
      category: 'groceries',
      amount: 19.99,
      currency: 'USD',
      notes: 'Weekly groceries',
      confidence: 'medium',
      items: [],
      tax: null,
      tip: null
    };

    jest.spyOn(receiptVisionService, 'extractFromImage').mockResolvedValue(mockResult);

    const app = buildApp();
    const res = await request(app)
      .post('/api/receipts/parse/image')
      .attach('file', Buffer.from('image-bytes'), 'receipt.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      extracted: mockResult
    });
    expect(receiptVisionService.extractFromImage).toHaveBeenCalled();
  });

  it('returns 400 when file is missing', async () => {
    const res = await request(buildApp())
      .post('/api/receipts/parse/image');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'No image file provided');
  });

  it('returns 503 when Gemini is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await request(buildApp())
      .post('/api/receipts/parse/image')
      .attach('file', Buffer.from('image-bytes'), 'receipt.jpg');

    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Gemini integration is not configured');
  });

  it('returns 422 when Gemini cannot provide required fields', async () => {
    const app = buildApp();
    jest.spyOn(receiptVisionService, 'extractFromImage')
      .mockRejectedValue(new Error('Gemini did not provide a total amount'));

    const res = await request(app)
      .post('/api/receipts/parse/image')
      .attach('file', Buffer.from('bad-image'), 'receipt.png');

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Failed to parse receipt image');
    expect(res.body.details).toContain('Gemini did not provide a total amount');
  });
});
