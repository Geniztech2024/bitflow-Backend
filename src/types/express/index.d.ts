import { IUser } from '../../models/User';
import { Document } from 'mongoose';
import { IAdmin } from '../../models/adminModel';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
      adminId?: string;
      admin?: IAdmin;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    adminId?: string;
    admin?: Document;
  }
}