import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { productSchema } from '../validations/product.schema';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, out_of_stock, low_stock, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } },
      ];
    }
    if (category) where.category = String(category);
    if (out_of_stock === 'true') {
      where.current_stock = 0;
    }
    if (low_stock === 'true') {
      where.current_stock = {
        lt: prisma.product.fields.minimum_stock, // Prisma doesn't directly support field comparison in where like this for sqlite, but we will handle it in JS or just query where current_stock <= minimum_stock manually if we could.
        // Actually, Prisma does not support comparing two columns in `where` easily without raw queries.
        // Let's just fetch them and filter if needed, or omit it. Let's omit `low_stock` DB filter and just do standard queries, we can do raw query if really needed.
        // For simplicity, let's omit `lt: minimum_stock` in db query unless it's a hardcoded value.
        // We'll skip low_stock DB filter for now as it's complex in Prisma without raw SQL.
      };
      delete where.current_stock;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Manual low_stock filter if requested
    let finalProducts = products;
    if (low_stock === 'true') {
      finalProducts = products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0);
    }

    res.status(200).json({
      success: true,
      data: finalProducts,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      message: 'Products retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: String(id) },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku: parseResult.data.sku } });
    if (existingSku) {
      res.status(409).json({ success: false, message: 'SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: parseResult.data,
    });

    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = productSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku: parseResult.data.sku } });
    if (existingSku && existingSku.id !== id) {
      res.status(409).json({ success: false, message: 'SKU already exists' });
      return;
    }

    const product = await prisma.product.update({
      where: { id: String(id) },
      data: parseResult.data,
    });

    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const movements = await prisma.stockMovement.findMany({
      where: { product_id: String(id) },
      orderBy: { created_at: 'desc' },
      include: { creator: { select: { name: true } } },
    });

    res.status(200).json({ success: true, data: movements, message: 'Stock movements retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, movement_type, reason } = req.body;

    if (!quantity || quantity <= 0 || !movement_type || !reason) {
      res.status(400).json({ success: false, message: 'Invalid stock adjustment data' });
      return;
    }

    if (movement_type !== 'IN' && movement_type !== 'OUT') {
      res.status(400).json({ success: false, message: 'Invalid movement type' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: String(id) } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (movement_type === 'OUT' && product.current_stock < quantity) {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock for product',
        available: product.current_stock,
        requested: quantity
      });
      return;
    }

    // Transaction for stock update and movement creation
    const newStock = movement_type === 'IN' ? product.current_stock + quantity : product.current_stock - quantity;

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: String(id) },
        data: { current_stock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          product_id: String(id),
          quantity,
          movement_type,
          reason,
          created_by: req.user.id,
        },
      }),
    ]);

    res.status(200).json({ success: true, data: { product: updatedProduct, movement }, message: 'Stock adjusted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
