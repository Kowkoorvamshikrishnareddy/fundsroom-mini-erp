import request from 'supertest';
import { app } from './app';
import { prisma } from '../utils/prisma';

let adminToken = '';
let customerId = '';
let productId = '';

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  adminToken = adminRes.body.data.token;

  // Create a customer for challan
  const custRes = await request(app).post('/api/customers').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Challan Customer', mobile: '1112223334', customer_type: 'RETAIL'
  });
  customerId = custRes.body.data.id;

  // Create a product and add stock
  const prodRes = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Challan Product', sku: 'CHAL-001', unit_price: 10, minimum_stock: 5
  });
  productId = prodRes.body.data.id;

  await request(app).post(`/api/products/${productId}/adjust-stock`).set('Authorization', `Bearer ${adminToken}`).send({
    quantity: 100, movement_type: 'IN', reason: 'Stock for challan'
  });
});

describe('Challan API', () => {
  let challanId = '';

  it('should create a draft challan', async () => {
    const res = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_id: customerId,
        items: [
          { product_id: productId, quantity: 10 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    challanId = res.body.data.id;

    // Verify stock is NOT deducted yet
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.current_stock).toBe(100);
  });

  it('should confirm challan and deduct stock', async () => {
    const res = await request(app)
      .post(`/api/challans/${challanId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Verify stock IS deducted
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.current_stock).toBe(90);

    // Verify status is confirmed
    const challan = await prisma.challan.findUnique({ where: { id: challanId } });
    expect(challan?.status).toBe('CONFIRMED');
  });

  it('should fail to confirm a challan if stock is insufficient', async () => {
    // Create new challan requesting 200 items (we only have 90)
    const draftRes = await request(app)
      .post('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_id: customerId,
        items: [
          { product_id: productId, quantity: 200 }
        ]
      });
    
    const newChallanId = draftRes.body.data.id;

    const res = await request(app)
      .post(`/api/challans/${newChallanId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
    
    // Ensure stock wasn't deducted
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.current_stock).toBe(90);
  });

  it('should cancel a confirmed challan and restore stock', async () => {
    const res = await request(app)
      .post(`/api/challans/${challanId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Verify stock is restored
    const product = await prisma.product.findUnique({ where: { id: productId } });
    expect(product?.current_stock).toBe(100);

    // Verify status is cancelled
    const challan = await prisma.challan.findUnique({ where: { id: challanId } });
    expect(challan?.status).toBe('CANCELLED');
  });
});
