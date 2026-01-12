import config from '../config/config';

describe('Emotion Service - Config', () => {
  it('should load configuration', () => {
    expect(config).toBeDefined();
    expect(config.port).toBe(3003);
    expect(config.serviceName).toBe('emotion-service');
  });

  it('should have allowed emotions configured', () => {
    expect(config.allowedEmotions).toBeDefined();
    expect(Array.isArray(config.allowedEmotions)).toBe(true);
    expect(config.allowedEmotions.length).toBeGreaterThan(0);
  });

  it('should have CORS configured', () => {
    expect(config.corsOrigin).toBeDefined();
    expect(Array.isArray(config.corsOrigin)).toBe(true);
  });

  it('should have rate limiting configured', () => {
    expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    expect(config.rateLimit.maxRequests).toBeGreaterThan(0);
  });

  it('should have database configured', () => {
    expect(config.database).toBeDefined();
    expect(config.database.host).toBeDefined();
  });
});
