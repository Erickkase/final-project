import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwtService from '../services/jwt.service';
import passwordService from '../services/password.service';

const router = Router();

// User interface (simulated without database)
interface User {
  userId: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

// In-memory database simulation
const users: Map<string, User> = new Map();
const refreshTokens: Set<string> = new Set();

// POST /login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email and password are required',
        requestId: req.requestId,
      });
    }

    // Find user (simulated)
    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid credentials',
        requestId: req.requestId,
      });
    }

    // Verify password
    const isPasswordValid = await passwordService.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid credentials',
        requestId: req.requestId,
      });
    }

    // Generate tokens
    const token = jwtService.generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = jwtService.generateRefreshToken(user.userId);
    refreshTokens.add(refreshToken);

    return res.status(200).json({
      statusCode: 200,
      message: 'Login successful',
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

// POST /register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email, password and name are required',
        requestId: req.requestId,
      });
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find((u) => u.email === email);

    if (existingUser) {
      return res.status(409).json({
        statusCode: 409,
        message: 'Email already registered',
        requestId: req.requestId,
      });
    }

    // Validate password strength
    const passwordValidation = passwordService.validateStrength(password);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Weak password',
        errors: passwordValidation.errors,
        requestId: req.requestId,
      });
    }

    // Create user
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

    // Generate tokens
    const token = jwtService.generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = jwtService.generateRefreshToken(newUser.userId);
    refreshTokens.add(refreshToken);

    return res.status(201).json({
      statusCode: 201,
      message: 'User registered successfully',
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

// GET /verify
router.get('/verify', (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token not provided',
        requestId: req.requestId,
      });
    }

    const payload = jwtService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Valid token',
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

// POST /refresh
router.post('/refresh', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Refresh token required',
        requestId: req.requestId,
      });
    }

    // Verify refresh token is valid
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid refresh token',
        requestId: req.requestId,
      });
    }

    const payload = jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      refreshTokens.delete(refreshToken);
      return res.status(401).json({
        statusCode: 401,
        message: 'Expired refresh token',
        requestId: req.requestId,
      });
    }

    // Get user
    const user = users.get(payload.userId);

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: 'User not found',
        requestId: req.requestId,
      });
    }

    // Generate new token
    const newToken = jwtService.generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = jwtService.generateRefreshToken(user.userId);
    
    // Invalidate previous refresh token
    refreshTokens.delete(refreshToken);
    refreshTokens.add(newRefreshToken);

    return res.status(200).json({
      statusCode: 200,
      message: 'Token refreshed successfully',
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

// POST /logout
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Logout successful',
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
