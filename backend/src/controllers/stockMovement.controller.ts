import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_id, movement_type, search, page = '1', limit = '10' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const whereClause: any = {};

    if (product_id) {
      whereClause.product_id = String(product_id);
    }
    
    if (movement_type) {
      whereClause.movement_type = String(movement_type);
    }
    
    if (search) {
      whereClause.OR = [
        { reason: { contains: String(search) } },
        { product: { name: { contains: String(search) } } },
        { product: { sku: { contains: String(search) } } }
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          creator: { select: { name: true, email: true } },
        },
      }),
      prisma.stockMovement.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: movements,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching global stock movements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
