import { config } from '../config/config';

describe('Configuration', () => {
  it('should have default port', () => {
    expect(config.port).toBeDefined();
  });

  it('should have JWT secret', () => {
    expect(config.jwtSecret).toBeDefined();
  });

  it('should have CORS origin', () => {
    expect(config.corsOrigin).toBeDefined();
  });

  it('should have service URLs', () => {
    expect(config.emotionServiceUrl).toBeDefined();
    expect(config.analyticsServiceUrl).toBeDefined();
    expect(config.goalServiceUrl).toBeDefined();
    expect(config.journalServiceUrl).toBeDefined();
  });
});
