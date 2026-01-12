import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

class JWTService {
  /**
   * Genera un token JWT
   */
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
      expiresIn: config.jwt.expiration as any,
      algorithm: 'HS256',
    };
    return jwt.sign(payload, config.jwt.secret as string, options);
  }

  /**
   * Genera un refresh token
   */
  generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiration as any,
      algorithm: 'HS256',
    };
    return jwt.sign({ userId }, config.jwt.refreshSecret as string, options);
  }

  /**
   * Verifica un token JWT
   */
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret as string, {
        algorithms: ['HS256'],
      }) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Verifica un refresh token
   */
  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret as string, {
        algorithms: ['HS256'],
      }) as { userId: string };
      return decoded;
    } catch (error) {
      console.error('Refresh token verification error:', error);
      return null;
    }
  }

  /**
   * Decodifica un token sin verificar la firma (solo para obtener información)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Extrae el token del header Authorization
   */
  extractToken(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

export default new JWTService();
