import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; name: string };

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: config.adminEmails.includes(user.email) ? 'admin' : 'user'
    };

    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const isConfiguredAdmin = req.user && config.adminEmails.includes(req.user.email.trim().toLowerCase());

  if (!isConfiguredAdmin) {
    return sendError(res, 403, 'Only administrators can invite team members');
  }

  next();
};
