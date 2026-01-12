import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Health check general
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Ready check
router.get('/ready', (req: Request, res: Response) => {
  res.status(200).json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

// Live check
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
