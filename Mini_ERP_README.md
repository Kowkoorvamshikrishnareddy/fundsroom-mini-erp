# Mini ERP & CRM - Fundsroom Infotech Case Study

## Project Overview
This project is a Full Stack Mini ERP/CRM application developed for wholesale/distribution businesses. It features complete customer management (CRM), product inventory tracking, and sales challan generation with strict transactional inventory deduction.

## Business Context
Wholesale and distribution businesses require robust tracking of their customers, precise inventory levels, and immutable transactional records of goods leaving the warehouse (Challans). This system ensures that stock is never reduced accidentally and that draft challans do not impact live inventory until confirmed.

## Features
- **Authentication & RBAC:** JWT-based login with distinct roles (Admin, Sales, Warehouse, Accounts).
- **Customer CRM:** Manage leads, active, and inactive customers. Track business details and log follow-up notes.
- **Product & Inventory:** Real-time stock tracking. Stock can only be modified via explicit Stock Movements (IN/OUT).
- **Sales Challans:** Create multi-product sales challans. Stock is strictly deducted upon confirmation, and restored if cancelled. Challans capture a point-in-time snapshot of product prices to ensure historical accuracy.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, React Router, Axios, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite
- **Testing:** Jest, Supertest (Backend) | Vitest, React Testing Library (Frontend)

## Architecture
The application uses a separated frontend (React) and backend (Express) architecture.
- The backend exposes RESTful APIs, protected by JWT authentication and role-based middleware.
- Prisma ORM interfaces with an SQLite database, heavily utilizing `$transaction` for critical business logic (like Challan confirmation).
- The frontend uses a centralized `AuthContext` for global state and a custom Axios instance for API interactions.

## Database Design
- `User`: Handles authentication and roles.
- `Customer`: Stores CRM data.
- `CustomerFollowup`: Logs CRM notes tied to a customer and creator.
- `Product`: Master product data and current stock.
- `StockMovement`: Immutable ledger of all inventory changes.
- `Challan` & `ChallanItem`: Stores sales transactions and historical pricing snapshots.

## Roles and Permissions
- **Admin**: Full access to all modules.
- **Sales**: Can manage customers, add follow-ups, and create challans. Cannot edit products.
- **Warehouse**: Can manage products and adjust stock. Cannot access customers or challans.
- **Accounts**: Read-only access to customers, products, and challans.

## Running Instructions
### Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing
Run the backend integration tests (which utilize an isolated SQLite test database):
```bash
cd backend
npm run test
```

Run frontend unit/integration tests:
```bash
cd frontend
npm run test
```

## Test Credentials
- Admin: admin@example.com / password123
- Sales: sales@example.com / password123
- Warehouse: warehouse@example.com / password123
- Accounts: accounts@example.com / password123

## Business Rules & Workflow
- **Draft Challans**: Do NOT deduct stock.
- **Challan Confirmation**: Strictly checks stock. If stock is insufficient, the transaction is rejected completely.
- **Stock Deductions**: Enforced via Prisma `$transaction` to ensure database consistency.
- **Price Snapshots**: `ChallanItem` stores the unit price at the time of creation, making historical records immune to future product price changes.
