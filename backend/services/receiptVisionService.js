const { GoogleGenerativeAI } = require('@google/generative-ai');

const VALID_CATEGORIES = [
  'groceries',
  'dining',
  'shopping',
  'transportation',
  'utilities',
  'entertainment',
  'health',
  'travel',
  'other'
];

const VALID_CONFIDENCE = ['high', 'medium', 'low'];

class ReceiptVisionService {
  constructor() {
    this.modelName = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
    this._model = null;
  }

  get isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /**
   * Extract receipt details from an image buffer using Gemini.
   * @param {Buffer} imageBuffer
   * @param {string} mimeType
   * @returns {Promise<object>}
   */
  async extractFromImage(imageBuffer, mimeType) {
    if (!this.isConfigured) {
      throw new Error('Gemini API key is not configured');
    }

    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      throw new Error('A valid image buffer is required');
    }

    const prompt = this.buildPrompt();
    const model = this.getModel();

    const base64Data = imageBuffer.toString('base64');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg'
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    const text = result?.response?.text?.();
    if (!text) {
      throw new Error('No response returned from Gemini');
    }

    return this.parseResponse(text);
  }

  getModel() {
    if (!this._model) {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this._model = client.getGenerativeModel({ model: this.modelName });
    }

    return this._model;
  }

  buildPrompt() {
    return `You are a computer vision system that reads receipts and returns structured JSON.

CRITICAL: Reply with ONLY valid JSON. No markdown, comments, explanations, or text.

Extract the following fields from the receipt image:
{
  "datetime": "ISO 8601 purchase datetime (use local receipt time; if only date present, use "<date>T12:00:00" with best guess timezone as UTC)",
  "merchant": "Store or merchant name",
  "category": "one of ${VALID_CATEGORIES.join(' | ')}",
  "amount": "numeric total amount paid",
  "currency": "3-letter ISO currency code, infer from symbol",
  "notes": "short human readable summary of the purchase or null",
  "confidence": "one of ${VALID_CONFIDENCE.join(' | ')}",
  "items": [
    {
      "description": "item label",
      "quantity": number or null,
      "price": "per-item price as numeric string or null",
      "total": "line total as numeric string or null"
    }
  ],
  "tax": "numeric tax amount or null",
  "tip": "numeric tip amount or null"
}

Rules:
- amount must equal the final total charged on the receipt.
- Infer currency from symbols ($, €, £, etc).
- If uncertain, set confidence to "low" and leave ambiguous numeric fields null.
- Return null for fields that cannot be reliably determined.
- Keep numbers as strings that can be parsed into decimals (e.g., "123.45").
- Ensure JSON is syntactically valid.`;
  }

  parseResponse(rawText) {
    const cleaned = this.cleanResponse(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`Gemini response was not valid JSON: ${error.message}`);
    }

    const normalized = this.normalize(parsed);
    this.validate(normalized);

    return normalized;
  }

  cleanResponse(text) {
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    let cleaned = text;
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }

    return cleaned.trim();
  }

  normalize(data) {
    const normalized = {
      datetime: data.datetime || null,
      merchant: data.merchant ? String(data.merchant).trim() : null,
      category: data.category ? String(data.category).toLowerCase().trim() : 'other',
      amount: this.parseAmount(data.amount),
      currency: data.currency ? String(data.currency).toUpperCase().trim() : null,
      notes: data.notes ? String(data.notes).trim() : null,
      confidence: data.confidence ? String(data.confidence).toLowerCase().trim() : 'medium',
      items: Array.isArray(data.items)
        ? data.items.map(item => this.normalizeItem(item)).filter(Boolean)
        : [],
      tax: this.parseAmount(data.tax),
      tip: this.parseAmount(data.tip)
    };

    if (normalized.category && !VALID_CATEGORIES.includes(normalized.category)) {
      normalized.category = 'other';
    }

    if (!VALID_CONFIDENCE.includes(normalized.confidence)) {
      normalized.confidence = 'medium';
    }

    if (normalized.datetime) {
      const dt = new Date(normalized.datetime);
      if (!Number.isNaN(dt.getTime())) {
        normalized.datetime = dt.toISOString();
      } else {
        normalized.datetime = null;
      }
    }

    return normalized;
  }

  normalizeItem(raw) {
    if (!raw) return null;

    const entry = {
      description: raw.description ? String(raw.description).trim() : null,
      quantity: raw.quantity === null || raw.quantity === undefined ? null : Number(raw.quantity),
      price: this.stringifyAmount(raw.price),
      total: this.stringifyAmount(raw.total)
    };

    return entry;
  }

  stringifyAmount(value) {
    const numeric = this.parseAmount(value);
    return numeric === null ? null : numeric.toFixed(2);
  }

  parseAmount(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? Number(value) : null;
    }

    const cleaned = String(value).replace(/[^0-9.,-]/g, '');
    const normalized = cleaned.replace(/,(?=\d{3}(?:\D|$))/g, '');
    const amount = parseFloat(normalized.replace(/,/g, ''));

    if (Number.isNaN(amount) || !Number.isFinite(amount)) {
      return null;
    }

    return Math.abs(Number(amount.toFixed(2)));
  }

  validate(data) {
    if (!data.merchant) {
      throw new Error('Gemini did not provide a merchant name');
    }

    if (data.amount === null) {
      throw new Error('Gemini did not provide a total amount');
    }

    if (!data.currency) {
      throw new Error('Gemini did not provide a currency');
    }
  }
}

module.exports = new ReceiptVisionService();
