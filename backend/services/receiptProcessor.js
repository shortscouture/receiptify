const gmailService = require('./gmailService');
const llmService = require('./llmService');
const { models } = require('../models');

class ReceiptProcessor {
  /**
   * Process a single email and extract receipt data
   */
  async processEmail(userId, emailId) {
    try {
      const Receipt = models.Receipt;
      
      // Check if already processed
      const existing = await Receipt.findOne({
        where: { userId, emailId }
      });

      if (existing) {
        console.log(`Email ${emailId} already processed`);
        return existing;
      }

      // Get email content
      const email = await gmailService.getEmail(userId, emailId);
      
      // Extract receipt data using LLM
      const extractedData = await llmService.extractReceiptData(
        email.body,
        {
          subject: email.subject,
          from: email.from,
          date: email.date
        }
      );

      // Create receipt record
      const receipt = await Receipt.create({
        userId,
        emailId: email.id,
        date: new Date(extractedData.date),
        merchant: extractedData.merchant,
        category: extractedData.category,
        amount: parseFloat(extractedData.amount),
        currency: extractedData.currency || 'USD',
        sourceEmail: email.from,
        subject: email.subject,
        notes: extractedData.items || null,
        rawEmailContent: email.body,
        llmResponse: JSON.stringify(extractedData),
        status: extractedData.confidence === 'low' ? 'manual_review' : 'processed'
      });

      console.log(`Processed receipt for ${extractedData.merchant}: ${extractedData.amount} ${extractedData.currency}`);
      
      return receipt;
    } catch (error) {
      console.error(`Error processing email ${emailId}:`, error);
      
      // Create failed record
      const Receipt = models.Receipt;
      await Receipt.create({
        userId,
        emailId,
        date: new Date(),
        merchant: 'Unknown',
        amount: 0,
        status: 'failed',
        notes: `Processing failed: ${error.message}`
      }).catch(err => console.error('Failed to create error record:', err));
      
      throw error;
    }
  }

  /**
   * Process recent emails for a user
   */
  async processRecentEmails(userId, daysBack = 7) {
    try {
      console.log(`Processing recent emails for user ${userId}`);
      
      // Get recent receipt emails
      const emailIds = await gmailService.getRecentReceipts(userId, daysBack);
      
      if (!emailIds || emailIds.length === 0) {
        console.log('No new receipt emails found');
        return [];
      }

      console.log(`Found ${emailIds.length} potential receipt emails`);
      
      // Process each email
      const results = [];
      for (const emailData of emailIds) {
        try {
          const receipt = await this.processEmail(userId, emailData.id);
          results.push(receipt);
          
          // Add delay to avoid rate limits
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to process email ${emailData.id}:`, error.message);
          results.push({ id: emailData.id, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing recent emails:', error);
      throw error;
    }
  }

  /**
   * Process all unprocessed emails for a user
   */
  async processAllEmails(userId, maxEmails = 50) {
    try {
      console.log(`Processing all emails for user ${userId}`);
      
      const query = 'label:receipts OR subject:(receipt OR order OR invoice)';
      const emailIds = await gmailService.searchEmails(userId, query, maxEmails);
      
      if (!emailIds || emailIds.length === 0) {
        console.log('No receipt emails found');
        return [];
      }

      console.log(`Found ${emailIds.length} receipt emails`);
      
      const results = [];
      for (const emailData of emailIds) {
        try {
          const receipt = await this.processEmail(userId, emailData.id);
          results.push(receipt);
          
          // Add delay to avoid rate limits
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to process email ${emailData.id}:`, error.message);
          results.push({ id: emailData.id, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing all emails:', error);
      throw error;
    }
  }

  /**
   * Helper: Add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ReceiptProcessor();
