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
    return `You are an AI assistant that extracts structured receipt/invoice data from emails.

Email Subject: ${metadata.subject || 'N/A'}
Email From: ${metadata.from || 'N/A'}
Email Date: ${metadata.date || 'N/A'}

Email Content:
${emailContent}

Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):
{
  "date": "YYYY-MM-DD format of purchase date",
  "merchant": "merchant/vendor name",
  "category": "one of: groceries, dining, shopping, transportation, utilities, entertainment, health, travel, other",
  "amount": "numeric amount without currency symbol",
  "currency": "3-letter currency code (e.g., USD, PHP, EUR)",
  "items": "brief description of items purchased",
  "confidence": "high, medium, or low"
}

If you cannot find a field, use null. Return ONLY the JSON object.`;
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
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const json = JSON.parse(text);
      
      // Validate required fields
      if (!json.date || !json.merchant || !json.amount) {
        throw new Error('Missing required fields in LLM response');
      }
      
      return json;
    } catch (error) {
      console.error('Failed to parse LLM response:', text);
      throw new Error('Invalid JSON response from LLM');
    }
  }
}

module.exports = new LLMService();
