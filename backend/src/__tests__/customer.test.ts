import request from 'supertest';
import { app } from './app';
import { prisma } from '../utils/prisma';

let adminToken = '';
let salesToken = '';
let warehouseToken = '';

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  adminToken = adminRes.body.data.token;

  const salesRes = await request(app).post('/api/auth/login').send({ email: 'sales@example.com', password: 'password123' });
  salesToken = salesRes.body.data.token;
  
  const whRes = await request(app).post('/api/auth/login').send({ email: 'warehouse@example.com', password: 'password123' });
  warehouseToken = whRes.body.data.token;
});

describe('Customer API', () => {
  let customerId = '';

  it('Admin should be able to create a customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Customer',
        mobile: '1234567890',
        customer_type: 'RETAIL'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Customer');
    customerId = res.body.data.id;
  });

  it('Warehouse should NOT be able to create a customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .send({
        name: 'WH Customer',
        mobile: '0987654321',
        customer_type: 'RETAIL'
      });

    expect(res.status).toBe(403);
  });

  it('Sales should be able to view customers', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
