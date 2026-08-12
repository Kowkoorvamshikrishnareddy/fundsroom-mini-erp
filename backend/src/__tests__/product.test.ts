import request from 'supertest';
import { app } from './app';
import { prisma } from '../utils/prisma';

let adminToken = '';

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  adminToken = adminRes.body.data.token;
});

describe('Product API', () => {
  let productId = '';

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        sku: 'TEST-SKU-001',
        unit_price: 100.0,
        minimum_stock: 10
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.current_stock).toBe(0); // initial stock is 0
    productId = res.body.data.id;
  });

  it('should prevent duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Product',
        sku: 'TEST-SKU-001',
        unit_price: 50.0,
        minimum_stock: 5
      });

    expect(res.status).toBe(409);
  });

  it('should manually adjust stock and record movement', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/adjust-stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        quantity: 50,
        movement_type: 'IN',
        reason: 'Initial Stock'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.product.current_stock).toBe(50);
    expect(res.body.data.movement.movement_type).toBe('IN');
  });

  it('should fetch stock movements for product', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}/stock-movements`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].quantity).toBe(50);
  });
});
