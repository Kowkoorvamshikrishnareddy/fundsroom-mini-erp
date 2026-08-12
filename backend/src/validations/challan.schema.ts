import { z } from 'zod';

export const challanItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const challanSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required'),
});
