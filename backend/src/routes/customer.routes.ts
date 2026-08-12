import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, addFollowup } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate);

// Sales, Admin, Accounts can view customers
router.get('/', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getCustomers);
router.get('/:id', authorize(['ADMIN', 'SALES', 'ACCOUNTS']), getCustomerById);

// Only Sales and Admin can create/edit customers
router.post('/', authorize(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', authorize(['ADMIN', 'SALES']), updateCustomer);
router.delete('/:id', authorize(['ADMIN']), deleteCustomer);

// Add follow up
router.post('/:id/followups', authorize(['ADMIN', 'SALES']), addFollowup);

export default router;
