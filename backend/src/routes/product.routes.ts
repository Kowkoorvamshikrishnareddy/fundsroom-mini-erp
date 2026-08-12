import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, getStockMovements, adjustStock } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate);

// View products: Admin, Sales, Warehouse, Accounts
router.get('/', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProducts);
router.get('/:id', authorize(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProductById);
router.get('/:id/stock-movements', authorize(['ADMIN', 'WAREHOUSE', 'ACCOUNTS']), getStockMovements);

// Manage products: Admin, Warehouse
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct);

// Manual stock adjustment: Admin, Warehouse
router.post('/:id/adjust-stock', authorize(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
