import request from 'supertest';
import app from '../app';

describe('API Gateway - Health Check', () => {
  it('should return ok status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ok');
  });
});

describe('API Gateway - Routes', () => {
  it('should return 404 for non-existent route', async () => {
    const response = await request(app).get('/api/v1/non-existent');
    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
  });

  it('should have X-Request-ID header in response', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-request-id']).toBeDefined();
  });
});

describe('API Gateway - Error Handling', () => {
  it('should handle invalid JSON', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('invalid json');
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
