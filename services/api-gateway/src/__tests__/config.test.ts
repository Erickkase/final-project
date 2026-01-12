import config from '../../config/config';

describe('API Gateway - Config', () => {
  it('should load configuration', () => {
    expect(config).toBeDefined();
    expect(config.port).toBeGreaterThan(0);
    expect(config.serviceName).toBe('api-gateway');
  });

  it('should have services configured', () => {
    expect(config.services.auth).toBeDefined();
    expect(config.services.emotion).toBeDefined();
    expect(config.services.report).toBeDefined();
  });

  it('should have CORS configured', () => {
    expect(config.corsOrigin).toBeDefined();
    expect(Array.isArray(config.corsOrigin)).toBe(true);
  });

  it('should have rate limiting configured', () => {
    expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    expect(config.rateLimit.maxRequests).toBeGreaterThan(0);
  });
});
