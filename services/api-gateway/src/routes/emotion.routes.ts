import { Router, Request, Response, NextFunction } from 'express';
import { emotionServiceProxy } from '../services/service-proxy';

const router = Router();

// Obtener todas las emociones registradas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await emotionServiceProxy.get('/emotions', {
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

// Obtener emoción por ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await emotionServiceProxy.get(`/emotions/${req.params.id}`, {
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

// Crear nueva emoción
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await emotionServiceProxy.post('/emotions', req.body, {
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

// Actualizar emoción
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await emotionServiceProxy.put(`/emotions/${req.params.id}`, req.body, {
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

// Eliminar emoción
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await emotionServiceProxy.delete(`/emotions/${req.params.id}`, {
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

export default router;
