import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwtService from '../services/jwt.service';
import passwordService from '../services/password.service';

const router = Router();

// Interfaz para usuario (simulado sin BD por ahora)
interface User {
  userId: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

// Simulación de base de datos en memoria
const users: Map<string, User> = new Map();
const refreshTokens: Set<string> = new Set();

// ========== POST /login ==========
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validación de entrada
    if (!email || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email y contraseña son requeridos',
        requestId: req.requestId,
      });
    }

    // Buscar usuario (simulado)
    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Credenciales inválidas',
        requestId: req.requestId,
      });
    }

    // Verificar contraseña
    const isPasswordValid = await passwordService.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Credenciales inválidas',
        requestId: req.requestId,
      });
    }

    // Generar tokens
    const token = jwtService.generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = jwtService.generateRefreshToken(user.userId);
    refreshTokens.add(refreshToken);

    return res.status(200).json({
      statusCode: 200,
      message: 'Sesión iniciada exitosamente',
      data: {
        token,
        refreshToken,
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// ========== POST /register ==========
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Validación de entrada
    if (!email || !password || !name) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email, contraseña y nombre son requeridos',
        requestId: req.requestId,
      });
    }

    // Validar si el usuario ya existe
    const existingUser = Array.from(users.values()).find((u) => u.email === email);

    if (existingUser) {
      return res.status(409).json({
        statusCode: 409,
        message: 'El email ya está registrado',
        requestId: req.requestId,
      });
    }

    // Validar fuerza de contraseña
    const passwordValidation = passwordService.validateStrength(password);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Contraseña débil',
        errors: passwordValidation.errors,
        requestId: req.requestId,
      });
    }

    // Crear usuario
    const userId = uuidv4();
    const hashedPassword = await passwordService.hash(password);

    const newUser: User = {
      userId,
      email,
      password: hashedPassword,
      role: role || 'student',
      createdAt: new Date(),
    };

    users.set(userId, newUser);

    // Generar tokens
    const token = jwtService.generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = jwtService.generateRefreshToken(newUser.userId);
    refreshTokens.add(refreshToken);

    return res.status(201).json({
      statusCode: 201,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        refreshToken,
        user: {
          userId: newUser.userId,
          email: newUser.email,
          role: newUser.role,
        },
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET /verify ==========
router.get('/verify', (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token no proporcionado',
        requestId: req.requestId,
      });
    }

    const payload = jwtService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token inválido o expirado',
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Token válido',
      data: {
        valid: true,
        payload,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// ========== POST /refresh ==========
router.post('/refresh', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Refresh token requerido',
        requestId: req.requestId,
      });
    }

    // Verificar que el refresh token sea válido
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Refresh token inválido',
        requestId: req.requestId,
      });
    }

    const payload = jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      refreshTokens.delete(refreshToken);
      return res.status(401).json({
        statusCode: 401,
        message: 'Refresh token expirado',
        requestId: req.requestId,
      });
    }

    // Obtener usuario
    const user = users.get(payload.userId);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Usuario no encontrado',
        requestId: req.requestId,
      });
    }

    // Generar nuevo token
    const newToken = jwtService.generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = jwtService.generateRefreshToken(user.userId);
    
    // Invalidad el refresh token anterior
    refreshTokens.delete(refreshToken);
    refreshTokens.add(newRefreshToken);

    return res.status(200).json({
      statusCode: 200,
      message: 'Token refrescado exitosamente',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// ========== POST /logout ==========
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Sesión cerrada exitosamente',
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
