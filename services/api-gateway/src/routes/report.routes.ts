import { Router, Request, Response, NextFunction } from 'express';
import { reportServiceProxy } from '../services/service-proxy';

const router = Router();

// Obtener todos los reportes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await reportServiceProxy.get('/reports', {
      headers: {
        'X-Request-ID': req.requestId,
        'Authorization': req.headers.authorization,
      },
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Obtener reporte por ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await reportServiceProxy.get(`/reports/${req.params.id}`, {
      headers: {
        'X-Request-ID': req.requestId,
        'Authorization': req.headers.authorization,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Generar reporte
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await reportServiceProxy.post('/reports', req.body, {
      headers: {
        'X-Request-ID': req.requestId,
        'Authorization': req.headers.authorization,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Obtener reportes por usuario
router.get('/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await reportServiceProxy.get(`/reports/user/${req.params.userId}`, {
      headers: {
        'X-Request-ID': req.requestId,
        'Authorization': req.headers.authorization,
      },
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
