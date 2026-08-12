import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate);

// View dashboard: Admin
router.get('/', authorize(['ADMIN']), getDashboardStats);

export default router;
