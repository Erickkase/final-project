import { config } from '../config/config';

describe('Journal Service Config', () => {
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

  it('should have emotion service URL', () => {
    expect(config.emotionServiceUrl).toBeDefined();
    expect(config.emotionServiceUrl).toContain('http');
  });
});
