const { google } = require('googleapis');
const { models } = require('../models');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  /**
   * Get OAuth2 client with user's tokens
   */
  async getAuthClient(userId) {
    const UserToken = models.UserToken;
    const userToken = await UserToken.findOne({ where: { userId } });

    if (!userToken) {
      throw new Error('User tokens not found. Please reconnect your Gmail account.');
    }

    // Check if token is expired
    if (userToken.expiryDate && new Date(userToken.expiryDate) < new Date()) {
      // Token expired, try to refresh
      this.oauth2Client.setCredentials({
        refresh_token: userToken.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update stored tokens
      await userToken.update({
        accessToken: credentials.access_token,
        expiryDate: new Date(credentials.expiry_date)
      });

      this.oauth2Client.setCredentials(credentials);
    } else {
      this.oauth2Client.setCredentials({
        access_token: userToken.accessToken,
        refresh_token: userToken.refreshToken
      });
    }

    return this.oauth2Client;
  }

  /**
   * Search for emails with specific query
   */
  async searchEmails(userId, query = 'label:receipts OR subject:(receipt OR order OR invoice)', maxResults = 10) {
    try {
      const auth = await this.getAuthClient(userId);
      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      return response.data.messages || [];
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  /**
   * Get email details by ID
   */
  async getEmail(userId, messageId) {
    try {
      const auth = await this.getAuthClient(userId);
      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return this.parseEmail(response.data);
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  }

  /**
   * Parse email data into readable format
   */
  parseEmail(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : null;
    };

    // Extract body
    let body = '';
    if (message.payload.parts) {
      // Multi-part email
      const textPart = message.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (message.payload.body.data) {
      // Simple email
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    // Clean HTML if present
    if (body.includes('<html') || body.includes('<div')) {
      body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Extract email address from "Name <email@example.com>" format
    const extractEmail = (fromHeader) => {
      if (!fromHeader) return null;
      const match = fromHeader.match(/<([^>]+)>/);
      return match ? match[1] : fromHeader.trim();
    };

    return {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader('Subject'),
      from: extractEmail(getHeader('From')),
      to: getHeader('To'),
      date: getHeader('Date'),
      body: body.substring(0, 5000), // Limit body size
      snippet: message.snippet,
      labels: message.labelIds || []
    };
  }

  /**
   * Get recent receipt emails
   */
  async getRecentReceipts(userId, daysBack = 7) {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '/');
    
    const query = `(label:receipts OR subject:(receipt OR order OR invoice OR purchase)) after:${dateString}`;
    
    return await this.searchEmails(userId, query, 50);
  }

  /**
   * Watch for new emails (setup push notifications)
   */
  async watchMailbox(userId, topicName) {
    try {
      const auth = await this.getAuthClient(userId);
      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: topicName,
          labelIds: ['INBOX']
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error setting up mailbox watch:', error);
      throw error;
    }
  }

  /**
   * Stop watching mailbox
   */
  async stopWatch(userId) {
    try {
      const auth = await this.getAuthClient(userId);
      const gmail = google.gmail({ version: 'v1', auth });

      await gmail.users.stop({
        userId: 'me'
      });

      return { success: true };
    } catch (error) {
      console.error('Error stopping mailbox watch:', error);
      throw error;
    }
  }
}

module.exports = new GmailService();
