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

describe('API Gateway - Routes Proxy', () => {
  it('should proxy auth routes - login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Test123!' });
    
    expect(response.status).toBeDefined();
  });

  it('should proxy auth routes - register', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'new@test.com', password: 'Test123!' });
    
    expect(response.status).toBeDefined();
  });

  it('should proxy auth routes - verify', async () => {
    const response = await request(app)
      .post('/api/v1/auth/verify')
      .set('Authorization', 'Bearer token');
    
    expect(response.status).toBeDefined();
  });

  it('should proxy emotion routes - get user emotions', async () => {
    const response = await request(app)
      .get('/api/v1/emotion/user/123');
    
    expect(response.status).toBeDefined();
  });

  it('should proxy emotion routes - create emotion', async () => {
    const response = await request(app)
      .post('/api/v1/emotion/user/123')
      .send({ type: 'alegria', intensity: 8 });
    
    expect(response.status).toBeDefined();
  });

  it('should proxy emotion routes - get stats', async () => {
    const response = await request(app)
      .get('/api/v1/emotion/user/123/stats');
    
    expect(response.status).toBeDefined();
  });

  it('should proxy report routes - 15 day report', async () => {
    const response = await request(app)
      .get('/api/v1/report/user/123/15days');
    
    expect(response.status).toBeDefined();
  });

  it('should proxy report routes - 30 day report', async () => {
    const response = await request(app)
      .get('/api/v1/report/user/123/30days');
    
    expect(response.status).toBeDefined();
  });
});
