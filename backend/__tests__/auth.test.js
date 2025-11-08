const request = require('supertest');
const { sequelize, initializeModels } = require('../models');

// Import app before it starts listening
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Authentication API', () => {
  beforeAll(async () => {
    initializeModels();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('john@example.com');
      expect(res.body.user.name).toBe('John Doe');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Another Jane',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already registered');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Bad Email',
          email: 'not-an-email',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: '12345'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/me', () => {
    let authToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Protected User',
          email: 'protected@example.com',
          password: 'securepass123'
        });
      authToken = res.body.token;
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('protected@example.com');
      expect(res.body.user.name).toBe('Protected User');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Access token required');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });
});
