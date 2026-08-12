import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalCustomers, totalProducts, lowStockProducts, outOfStockProducts, recentChallans, recentFollowups] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      
      // Low stock: > 0 but <= minimum_stock. For SQLite we have to fetch all or we can just fetch and filter in memory, 
      // but let's just do a simpler query: stock <= minimum_stock (actually SQLite prisma doesn't support comparing two columns directly in where, so we fetch and filter)
      prisma.product.findMany({
        select: { current_stock: true, minimum_stock: true }
      }),
      
      prisma.product.count({ where: { current_stock: 0 } }),
      
      prisma.challan.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { customer: { select: { name: true } } }
      }),

      // Upcoming followups (today or later)
      prisma.customer.findMany({
        where: { follow_up_date: { not: null } },
        orderBy: { follow_up_date: 'asc' },
        take: 5,
        select: { id: true, name: true, follow_up_date: true }
      })
    ]);

    // Calculate low stock manually because Prisma can't compare two columns in SQLite without raw SQL easily
    const lowStockCount = lowStockProducts.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0).length;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          totalProducts,
          lowStockCount,
          outOfStockProducts
        },
        recentChallans,
        upcomingFollowups: recentFollowups
      },
      message: 'Dashboard stats retrieved'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
