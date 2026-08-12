import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  business_name: z.string().optional(),
  gst_number: z.string().optional(),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

export const followupSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  follow_up_date: z.string().datetime().optional(),
});
