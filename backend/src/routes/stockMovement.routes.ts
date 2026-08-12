import { Router } from 'express';
import { getAllStockMovements } from '../controllers/stockMovement.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate);

// View all stock movements: Admin, Warehouse, Accounts
router.get('/', authorize(['ADMIN', 'WAREHOUSE', 'ACCOUNTS']), getAllStockMovements);

export default router;
