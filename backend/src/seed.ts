import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      password_hash: password,
    },
    {
      email: 'sales@example.com',
      name: 'Sales User',
      role: 'SALES',
      password_hash: password,
    },
    {
      email: 'warehouse@example.com',
      name: 'Warehouse User',
      role: 'WAREHOUSE',
      password_hash: password,
    },
    {
      email: 'accounts@example.com',
      name: 'Accounts User',
      role: 'ACCOUNTS',
      password_hash: password,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Database seeded with test users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
