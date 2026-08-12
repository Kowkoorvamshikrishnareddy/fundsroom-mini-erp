import express from 'express';
import authRoutes from '../routes/auth.routes';
import customerRoutes from '../routes/customer.routes';
import productRoutes from '../routes/product.routes';
import challanRoutes from '../routes/challan.routes';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

export { app };
