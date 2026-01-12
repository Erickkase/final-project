import { Router, Request, Response, NextFunction } from 'express';
import { authServiceProxy } from '../services/service-proxy';

const router = Router();

// Proxy para login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authServiceProxy.post('/login', req.body, {
      headers: {
        'X-Request-ID': req.requestId,
        'X-Forwarded-For': req.ip,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy para registro
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authServiceProxy.post('/register', req.body, {
      headers: {
        'X-Request-ID': req.requestId,
        'X-Forwarded-For': req.ip,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy para verificar token
router.get('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    
    const response = await authServiceProxy.get('/verify', {
      headers: {
        'X-Request-ID': req.requestId,
        'Authorization': token,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy para refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authServiceProxy.post('/refresh', req.body, {
      headers: {
        'X-Request-ID': req.requestId,
        'X-Forwarded-For': req.ip,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Proxy para logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authServiceProxy.post('/logout', req.body, {
      headers: {
        'X-Request-ID': req.requestId,
        'X-Forwarded-For': req.ip,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
