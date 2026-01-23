import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
  });
});

export default router;
