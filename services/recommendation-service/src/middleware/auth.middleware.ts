import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
