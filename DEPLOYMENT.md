# Deployment Instructions

This repository is pre-configured for automated deployment to **Vercel** (Frontend) and **Render** (Backend + Database).

## Platform Limitation Note
Because this environment is isolated, an automated live deployment could not be triggered directly from this workspace (as it requires external OAuth permissions for Vercel/Render). The following instructions detail exactly how to execute the deployment using the configuration files provided.

## 1. Backend & Database (Render)
The backend utilizes Node.js and a PostgreSQL database (Prisma handles the SQLite to Postgres transition automatically).

1. Create a free account on [Render.com](https://render.com/).
2. Connect your GitHub account and select this repository.
3. Render will automatically detect the `render.yaml` file in the root directory.
4. It will automatically provision:
   - A PostgreSQL Database (`fundsroom-erp-db`)
   - A Node.js Web Service (`fundsroom-erp-backend`)
5. The `DATABASE_URL` and `JWT_SECRET` environment variables will be securely auto-generated and linked.
6. Once deployed, copy the **Backend URL** (e.g., `https://fundsroom-erp-backend.onrender.com`).

## 2. Frontend (Vercel)
The frontend is a React application built with Vite.

1. Create a free account on [Vercel.com](https://vercel.com/).
2. Connect your GitHub account and import this repository.
3. Vercel will automatically detect the `vercel.json` configuration file.
4. Before clicking "Deploy", add the following **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `<YOUR_RENDER_BACKEND_URL>/api` (e.g., `https://fundsroom-erp-backend.onrender.com/api`)
5. Click **Deploy**.

## 3. Verify Deployment
After both services are live:
1. Open the Vercel Frontend URL.
2. Login with `admin@example.com` and `password123`.
3. Verify the Dashboard, Customers, Products, and Stock Movements pages load correctly.
4. Create a test Challan to confirm the frontend correctly communicates with the backend, and that the database handles transactions appropriately.
5. All JWT tokens and sensitive routes are securely protected in the production environment.
