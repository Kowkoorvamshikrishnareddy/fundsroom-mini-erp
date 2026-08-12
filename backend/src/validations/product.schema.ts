import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().optional(),
  unit_price: z.number().min(0, 'Price cannot be negative'),
  minimum_stock: z.number().min(0).default(0),
  warehouse_location: z.string().optional(),
});
