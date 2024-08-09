import { Request, Response, NextFunction } from 'express';
import { IAdmin } from '../models/adminModel'; // Import the IAdmin interface

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const admin = req.admin as IAdmin; // Cast req.admin to IAdmin

  if (!admin || admin.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied, not a superadmin' });
  }
  next();
};
