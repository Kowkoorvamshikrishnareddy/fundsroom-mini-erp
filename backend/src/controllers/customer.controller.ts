import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { customerSchema, followupSchema } from '../validations/customer.schema';
import { AuthRequest } from '../middleware/auth';

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { mobile: { contains: String(search) } },
        { business_name: { contains: String(search) } },
      ];
    }
    if (type) where.customer_type = String(type);
    if (status) where.status = String(status);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      message: 'Customers retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: String(id) },
      include: {
        followups: {
          orderBy: { created_at: 'desc' },
          include: { creator: { select: { name: true } } },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = customerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const customer = await prisma.customer.create({
      data: parseResult.data,
    });

    res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parseResult = customerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id: String(id) },
      data: parseResult.data,
    });

    res.status(200).json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id: String(id) } });
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addFollowup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // customer_id
    const parseResult = followupSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input', errors: parseResult.error.issues });
      return;
    }

    const followup = await prisma.customerFollowup.create({
      data: {
        customer_id: String(id),
        note: parseResult.data.note,
        follow_up_date: parseResult.data.follow_up_date ? new Date(parseResult.data.follow_up_date) : null,
        created_by: req.user.id,
      },
    });

    // Also update customer's next follow up date
    if (parseResult.data.follow_up_date) {
      await prisma.customer.update({
        where: { id: String(id) },
        data: { follow_up_date: new Date(parseResult.data.follow_up_date) }
      });
    }

    res.status(201).json({ success: true, data: followup, message: 'Followup added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
