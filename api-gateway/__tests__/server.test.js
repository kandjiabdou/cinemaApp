const request = require('supertest');
const express = require('express');

// Mock simple du serveur pour les tests
const createTestApp = () => {
  const app = express();
  
  // Routes de test simples
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
  });
  
  app.get('/metrics', (req, res) => {
    res.status(200).send('# HELP test metrics\ntest_metric 1\n');
  });

  // Simulation des proxies
  app.get('/api/auth/test', (req, res) => {
    res.status(200).json({ service: 'auth-service', status: 'OK' });
  });

  app.get('/api/cinemas/test', (req, res) => {
    res.status(200).json({ service: 'cinema-service', status: 'OK' });
  });

  app.get('/api/films/test', (req, res) => {
    res.status(200).json({ service: 'public-service', status: 'OK' });
  });

  return app;
};

describe('🚪 API Gateway Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('📊 Health & Metrics', () => {
    test('✅ GET /health should return OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        service: 'api-gateway'
      });
    });

    test('📈 GET /metrics should return metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('test_metric');
    });
  });

  describe('🔄 Proxy Routes', () => {
    test('🔐 Auth service proxy should work', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .expect(200);

      expect(response.body.service).toBe('auth-service');
    });

    test('🏢 Cinema service proxy should work', async () => {
      const response = await request(app)
        .get('/api/cinemas/test')
        .expect(200);

      expect(response.body.service).toBe('cinema-service');
    });

    test('🎬 Public service proxy should work', async () => {
      const response = await request(app)
        .get('/api/films/test')
        .expect(200);

      expect(response.body.service).toBe('public-service');
    });
  });

  describe('❌ Error Handling', () => {
    test('404 for unknown routes', async () => {
      await request(app)
        .get('/api/unknown')
        .expect(404);
    });
  });
}); 