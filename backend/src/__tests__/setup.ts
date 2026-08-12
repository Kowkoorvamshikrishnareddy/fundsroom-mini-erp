import dotenv from 'dotenv';
import path from 'path';

// Load .env.test before anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

import { execSync } from 'child_process';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  // Push the schema to the test database
  console.log('Pushing database schema to test.db...');
  execSync('npx prisma db push --accept-data-loss', { env: { ...process.env, DATABASE_URL: 'file:./test.db' } });

  // Reset database tables
  await prisma.stockMovement.deleteMany({});
  await prisma.challanItem.deleteMany({});
  await prisma.challan.deleteMany({});
  await prisma.customerFollowup.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  // Don't delete users, we'll upsert them

  // Seed the test database
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { email: 'admin@example.com', name: 'Admin User', role: 'ADMIN', password_hash: password },
    { email: 'sales@example.com', name: 'Sales User', role: 'SALES', password_hash: password },
    { email: 'warehouse@example.com', name: 'Warehouse User', role: 'WAREHOUSE', password_hash: password },
    { email: 'accounts@example.com', name: 'Accounts User', role: 'ACCOUNTS', password_hash: password },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
