const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test-secret-key-for-unimart';
process.env.JWT_EXPIRES_IN = '1d';

let mongoServer;
let app;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  app = require('../server');
  await mongoose.connection.asPromise();
});

after(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe('UniMart API', () => {
  let token;
  let userId;
  let productId;
  let sellerToken;
  let sellerId;
  let chatId;

  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('POST /api/auth/register creates user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@college.edu',
      password: 'secret123',
      college: 'Test College',
      department: 'CS',
      year: '3rd',
      phone: '9876543210',
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.token);
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('POST /api/auth/login returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@college.edu',
      password: 'secret123',
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  it('GET /api/auth/profile requires auth', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'test@college.edu');
  });

  it('registers seller for product tests', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Seller User',
      email: 'seller@college.edu',
      password: 'secret123',
      college: 'Test College',
      department: 'EE',
      year: '4th',
    });

    assert.equal(res.status, 201);
    sellerToken = res.body.data.token;
    sellerId = res.body.data.user.id;
  });

  it('POST /api/products creates product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Dell Laptop',
        description: 'Good condition laptop for students',
        category: 'Electronics',
        price: 22000,
        condition: 'Good',
        specifications: '8GB RAM, 512GB SSD',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.title, 'Dell Laptop');
    productId = res.body.data._id;
  });

  it('GET /api/products lists products', async () => {
    const res = await request(app).get('/api/products');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.pagination);
  });

  it('GET /api/products/:id returns product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, 'Dell Laptop');
  });

  it('POST /api/wishlist/:productId adds item', async () => {
    const res = await request(app)
      .post(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 201);
  });

  it('GET /api/wishlist returns items', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  it('POST /api/chat creates thread', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, sellerId });

    assert.equal(res.status, 201);
    chatId = res.body.data._id;
  });

  it('POST /api/chat/message sends message', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set('Authorization', `Bearer ${token}`)
      .send({ chatId, message: 'Is this still available?' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.message, 'Is this still available?');
  });

  it('GET /api/chat/:chatId/messages returns messages', async () => {
    const res = await request(app)
      .get(`/api/chat/${chatId}/messages`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  it('DELETE /api/wishlist/:productId removes item', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
  });

  it('POST /api/auth/logout returns success', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
