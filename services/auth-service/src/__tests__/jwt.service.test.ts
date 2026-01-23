import jwtService from '../services/jwt.service';

describe('JWT Service', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'student',
  };

  it('should generate a token', () => {
    const token = jwtService.generateToken(testPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT structure
  });

  it('should verify a valid token', () => {
    const token = jwtService.generateToken(testPayload);
    const verified = jwtService.verifyToken(token);
    
    expect(verified).toBeDefined();
    expect(verified?.userId).toBe(testPayload.userId);
    expect(verified?.email).toBe(testPayload.email);
    expect(verified?.role).toBe(testPayload.role);
  });

  it('should return null for invalid token', () => {
    const verified = jwtService.verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });

  it('should generate a refresh token', () => {
    const refreshToken = jwtService.generateRefreshToken('test-user-123');
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');
  });

  it('should verify a valid refresh token', () => {
    const refreshToken = jwtService.generateRefreshToken('test-user-123');
    const verified = jwtService.verifyRefreshToken(refreshToken);
    
    expect(verified).toBeDefined();
    expect(verified?.userId).toBe('test-user-123');
  });

  it('should decode token without verification', () => {
    const token = jwtService.generateToken(testPayload);
    const decoded = jwtService.decodeToken(token);
    
    expect(decoded).toBeDefined();
    expect(decoded?.userId).toBe(testPayload.userId);
  });

  it('should extract token from Authorization header', () => {
    const token = jwtService.generateToken(testPayload);
    const authHeader = `Bearer ${token}`;
    const extracted = jwtService.extractToken(authHeader);
    
    expect(extracted).toBe(token);
  });

  it('should return null for invalid Authorization header', () => {
    const extracted1 = jwtService.extractToken('InvalidBearer token');
    const extracted2 = jwtService.extractToken(undefined);
    
    expect(extracted1).toBeNull();
    expect(extracted2).toBeNull();
  });
});
