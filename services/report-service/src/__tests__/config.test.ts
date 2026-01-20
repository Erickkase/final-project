import { config } from '../config/config';

describe('Config', () => {
  it('should have default port', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
  });

  it('should have node environment', () => {
    expect(config.nodeEnv).toBeDefined();
  });

  it('should have jwt secret', () => {
    expect(config.jwtSecret).toBeDefined();
  });

  it('should have emotion service url', () => {
    expect(config.emotionServiceUrl).toBeDefined();
  });
});
