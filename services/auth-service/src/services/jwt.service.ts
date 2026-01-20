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
   * Generates a JWT token
   */
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
      expiresIn: config.jwt.expiration as any,
      algorithm: 'HS256',
    };
    return jwt.sign(payload, config.jwt.secret as string, options);
  }

  /**
   * Generates a refresh token
   */
  generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiration as any,
      algorithm: 'HS256',
    };
    return jwt.sign({ userId }, config.jwt.refreshSecret as string, options);
  }

  /**
   * Verifies a JWT token
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
   * Verifies a refresh token
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
   * Decodes a token without verifying the signature (for information only)
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
   * Extracts token from Authorization header
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
