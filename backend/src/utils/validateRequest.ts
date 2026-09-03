import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from './response';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  next();
};
