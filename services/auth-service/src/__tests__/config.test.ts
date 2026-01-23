import config from '../config/config';

describe('Auth Service - Config', () => {
  it('should load configuration', () => {
    expect(config).toBeDefined();
    expect(config.port).toBe(3001);
    expect(config.serviceName).toBe('auth-service');
  });

  it('should have JWT secrets configured', () => {
    expect(config.jwt.secret).toBeDefined();
    expect(config.jwt.refreshSecret).toBeDefined();
  });

  it('should have JWT expiration configured', () => {
    expect(config.jwt.expiration).toBeDefined();
    expect(config.jwt.refreshExpiration).toBeDefined();
  });

  it('should have CORS configured', () => {
    expect(config.corsOrigin).toBeDefined();
    expect(Array.isArray(config.corsOrigin)).toBe(true);
  });

  it('should have bcrypt rounds configured', () => {
    expect(config.bcryptRounds).toBeGreaterThan(0);
  });
});
