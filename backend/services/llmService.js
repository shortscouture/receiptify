class LLMService {
  /**
   * Extract receipt data from email content using LLM
   */
  async extractReceiptData(emailContent, emailMetadata = {}) {
    const prompt = this.buildPrompt(emailContent, emailMetadata);
    
    // Try multiple LLM providers in order of preference
    const providers = [
      { name: 'gemini', method: this.callGemini.bind(this) },
      { name: 'openrouter', method: this.callOpenRouter.bind(this) },
      { name: 'openai', method: this.callOpenAI.bind(this) }
    ];

    for (const provider of providers) {
      try {
        if (this.isProviderConfigured(provider.name)) {
          console.log(`Trying LLM provider: ${provider.name}`);
          const result = await provider.method(prompt);
          return result;
        }
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error.message);
        continue;
      }
    }

    throw new Error('All LLM providers failed or are not configured');
  }

  /**
   * Build prompt for LLM
   */
  buildPrompt(emailContent, metadata) {
    return `You are a JSON-only API that extracts receipt data from emails. 

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations, no extra text.

Email Subject: ${metadata.subject || 'N/A'}
Email From: ${metadata.from || 'N/A'}
Email Date: ${metadata.date || 'N/A'}

Email Content:
${emailContent.substring(0, 3000)}

Return this exact JSON structure (replace values, keep structure):
{
  "date": "YYYY-MM-DD",
  "merchant": "merchant name",
  "category": "groceries|dining|shopping|transportation|utilities|entertainment|health|travel|other",
  "amount": "123.45",
  "currency": "USD",
  "items": "brief description or null",
  "confidence": "high|medium|low"
}

CRITICAL Rules:
- date: Purchase date in YYYY-MM-DD format (use email date if not found)
- merchant: Company/store name from the receipt
- category: MUST be one of the listed options
- amount: MUST be the TOTAL AMOUNT PAID as a number (e.g., "711.75"). Look for terms like "Total", "Amount paid", "Total due", "Charged", or the largest amount. Extract from currency symbols like $, €, £, ₱, ¥, etc.
- currency: 3-letter ISO code matching the currency symbol ($ = USD, € = EUR, £ = GBP, ₱ = PHP, ¥ = JPY, etc.)
- items: Short description of what was purchased
- confidence: high if amount and merchant are clear, medium if some unclear, low if guessing

IMPORTANT: The amount field MUST contain a valid positive number. If no amount found, use confidence "low" but still extract a reasonable estimate.

Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider) {
    switch (provider) {
      case 'gemini':
        return !!process.env.GEMINI_API_KEY;
      case 'openrouter':
        return !!process.env.OPENROUTER_API_KEY;
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      default:
        return false;
    }
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-pro';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    return this.parseResponse(text);
  }

  /**
   * Call OpenRouter API
   */
  async callOpenRouter(prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost',
        'X-Title': 'Receiptify'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    
    return this.parseResponse(text);
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    
    return this.parseResponse(text);
  }

  /**
   * Parse LLM response and extract JSON
   */
  parseResponse(text) {
    if (!text) {
      throw new Error('Empty response from LLM');
    }

    console.log('Raw LLM response:', text.substring(0, 200));

    // Try multiple parsing strategies
    let jsonText = text;

    // Strategy 1: Remove markdown code blocks
    jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Strategy 2: Remove common prefixes
    jsonText = jsonText.replace(/^Here's the extracted data:?\s*/i, '');
    jsonText = jsonText.replace(/^Here is the JSON:?\s*/i, '');
    jsonText = jsonText.replace(/^The extracted receipt data is:?\s*/i, '');
    jsonText = jsonText.replace(/^Based on the email.*?:\s*/i, '');

    // Strategy 3: Extract JSON from text (find first { to last })
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    // Strategy 4: Clean up extra text after JSON
    const jsonEndMatch = jsonText.match(/^(\{[\s\S]*?\})\s*$/);
    if (jsonEndMatch) {
      jsonText = jsonEndMatch[1];
    }

    // Remove any trailing text after the closing brace
    const lastBraceIndex = jsonText.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      jsonText = jsonText.substring(0, lastBraceIndex + 1);
    }

    jsonText = jsonText.trim();

    console.log('Cleaned JSON text:', jsonText.substring(0, 200));

    try {
      const json = JSON.parse(jsonText);
      
      // Validate required fields
      if (!json.date || !json.merchant || !json.amount || json.amount === null) {
        console.error('Missing required fields:', json);
        throw new Error('Missing required fields in LLM response: date, merchant, or amount');
      }

      // Sanitize and validate data
      const sanitized = {
        date: json.date,
        merchant: String(json.merchant).trim(),
        category: json.category || 'other',
        amount: parseFloat(json.amount),
        currency: json.currency || 'USD',
        items: json.items || null,
        confidence: json.confidence || 'medium'
      };

      // Validate amount is a valid number
      if (isNaN(sanitized.amount) || sanitized.amount <= 0) {
        console.error('Invalid amount:', sanitized.amount);
        throw new Error('Invalid or missing amount in LLM response');
      }

      // Validate category
      const validCategories = ['groceries', 'dining', 'shopping', 'transportation', 'utilities', 'entertainment', 'health', 'travel', 'other'];
      if (!validCategories.includes(sanitized.category)) {
        sanitized.category = 'other';
      }

      // Validate confidence
      const validConfidence = ['high', 'medium', 'low'];
      if (!validConfidence.includes(sanitized.confidence)) {
        sanitized.confidence = 'medium';
      }

      console.log('Successfully parsed receipt:', sanitized);
      return sanitized;
    } catch (error) {
      console.error('Failed to parse LLM response:', error.message);
      console.error('Attempted to parse:', jsonText);
      
      // Last resort: try to extract key information with regex
      try {
        const fallback = this.fallbackExtraction(text);
        if (fallback) {
          console.log('Using fallback extraction:', fallback);
          return fallback;
        }
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError.message);
      }
      
      throw new Error(`Invalid JSON response from LLM: ${error.message}`);
    }
  }

  /**
   * Fallback extraction if JSON parsing fails
   */
  fallbackExtraction(text) {
    // Try to extract key fields using regex patterns
    const dateMatch = text.match(/"date"\s*:\s*"([^"]+)"/);
    const merchantMatch = text.match(/"merchant"\s*:\s*"([^"]+)"/);
    const amountMatch = text.match(/"amount"\s*:\s*"?([0-9.]+)"?/);
    const categoryMatch = text.match(/"category"\s*:\s*"([^"]+)"/);
    const currencyMatch = text.match(/"currency"\s*:\s*"([^"]+)"/);

    if (dateMatch && merchantMatch && amountMatch) {
      return {
        date: dateMatch[1],
        merchant: merchantMatch[1],
        category: categoryMatch ? categoryMatch[1] : 'other',
        amount: parseFloat(amountMatch[1]),
        currency: currencyMatch ? currencyMatch[1] : 'USD',
        items: null,
        confidence: 'low'
      };
    }

    return null;
  }
}

module.exports = new LLMService();
