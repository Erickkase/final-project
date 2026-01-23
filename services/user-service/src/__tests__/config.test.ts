import { config } from '../config/config';

describe('User Service Config', () => {
  it('should have required config values', () => {
    expect(config.port).toBeDefined();
    expect(config.nodeEnv).toBeDefined();
    expect(config.jwtSecret).toBeDefined();
  });

  it('should have valid port number', () => {
    expect(typeof config.port).toBe('number');
    expect(config.port).toBeGreaterThan(0);
    expect(config.port).toBeLessThan(65536);
  });

  it('should have valid environment', () => {
    expect(['development', 'production', 'test']).toContain(config.nodeEnv);
  });

  it('should have auth service URL', () => {
    expect(config.authServiceUrl).toBeDefined();
    expect(config.authServiceUrl).toContain('http');
  });

  it('should have file upload constraints', () => {
    expect(config.maxFileSize).toBeGreaterThan(0);
    expect(config.allowedMimeTypes).toBeInstanceOf(Array);
    expect(config.allowedMimeTypes.length).toBeGreaterThan(0);
  });
});
