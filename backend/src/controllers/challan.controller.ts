import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { challanSchema } from '../validations/challan.schema';
import { AuthRequest } from '../middleware/auth';

// Helper to generate challan number
const generateChallanNumber = async (): Promise<string> => {
  const count = await prisma.challan.count();
  const num = (count + 1).toString().padStart(4, '0');
  return `CH-${num}`;
};

export const getChallans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, customer_id, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = String(status);
    if (customer_id) where.customer_id = String(customer_id);

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { name: true, business_name: true } },
          creator: { select: { name: true } }
        }
      }),
      prisma.challan.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: challans,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      message: 'Challans retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getChallanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id: String(id) },
      include: {
        items: true,
        customer: true,
        creator: { select: { name: true } },
      },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = challanSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const { customer_id, items } = parseResult.data;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customer_id } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    // Process items and get snapshots
    let totalQuantity = 0;
    const itemsToCreate = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.product_id } });
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item.product_id} not found` });
        return;
      }

      totalQuantity += item.quantity;
      itemsToCreate.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.unit_price,
        quantity: item.quantity,
        total: product.unit_price * item.quantity,
      });
    }

    const challanNumber = await generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challan_number: challanNumber,
        customer_id,
        total_quantity: totalQuantity,
        status: 'DRAFT',
        created_by: req.user.id,
        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });

    res.status(201).json({ success: true, data: challan, message: 'Draft Challan created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const challan = await prisma.challan.findUnique({
      where: { id: String(id) },
      include: { items: true },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ success: false, message: 'Only DRAFT challans can be confirmed' });
      return;
    }

    // Execute within a transaction
    await prisma.$transaction(async (tx) => {
      // Check stock and deduct
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.product_id } });
        if (!product) {
          throw new Error(`Product ${item.product_name} no longer exists`);
        }

        if (product.current_stock < item.quantity) {
          throw {
            type: 'STOCK_ERROR',
            message: `Insufficient stock for product ${product.name}`,
            available: product.current_stock,
            requested: item.quantity
          };
        }

        // Deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: { current_stock: product.current_stock - item.quantity },
        });

        // Create movement
        await tx.stockMovement.create({
          data: {
            product_id: product.id,
            quantity: item.quantity,
            movement_type: 'OUT',
            reason: `Sales Challan ${challan.challan_number}`,
            created_by: req.user.id,
          },
        });
      }

      // Mark challan as confirmed
      await tx.challan.update({
        where: { id: String(id) },
        data: { status: 'CONFIRMED' },
      });
    });

    res.status(200).json({ success: true, message: 'Challan confirmed successfully' });
  } catch (error: any) {
    if (error.type === 'STOCK_ERROR') {
      res.status(400).json({
        success: false,
        message: error.message,
        available: error.available,
        requested: error.requested
      });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error during confirmation' });
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const challan = await prisma.challan.findUnique({
      where: { id: String(id) },
      include: { items: true },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Challan is already cancelled' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // If it was confirmed, we need to revert the stock deduction
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.product_id } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { current_stock: product.current_stock + item.quantity },
            });

            await tx.stockMovement.create({
              data: {
                product_id: product.id,
                quantity: item.quantity,
                movement_type: 'IN',
                reason: `Cancelled Challan ${challan.challan_number}`,
                created_by: req.user.id,
              },
            });
          }
        }
      }

      await tx.challan.update({
        where: { id: String(id) },
        data: { status: 'CANCELLED' },
      });
    });

    res.status(200).json({ success: true, message: 'Challan cancelled successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during cancellation' });
  }
};
