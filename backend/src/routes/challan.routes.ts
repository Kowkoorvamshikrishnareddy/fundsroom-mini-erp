import { Router } from 'express';
import { getChallans, getChallanById, createChallan, confirmChallan, cancelChallan } from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate);

// View challans: Admin, Sales, Accounts
router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getChallans);
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getChallanById);

// Create challan: Admin, Sales
router.post('/', authorize(['ADMIN', 'SALES']), createChallan);

// Confirm challan: Admin, Sales (based on business rules, Sales usually confirms unless approval is needed. Let's allow Sales to confirm their draft)
router.post('/:id/confirm', authorize(['ADMIN', 'SALES']), confirmChallan);

// Cancel challan: Admin, Sales
router.post('/:id/cancel', authorize(['ADMIN', 'SALES']), cancelChallan);

export default router;
