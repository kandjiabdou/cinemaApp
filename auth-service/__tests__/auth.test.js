const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock simple du serveur pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock database
  const mockUsers = [];

  // Routes de test
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'auth-service' });
  });

  app.get('/metrics', (req, res) => {
    res.status(200).send('# HELP auth metrics\nauth_requests_total 1\n');
  });

  app.post('/register', async (req, res) => {
    const { nom, login, mot_de_passe, email } = req.body;
    
    // Validation très simple
    if (!nom || !login || !mot_de_passe || !email) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    if (mockUsers.find(u => u.login === login)) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }

    // Ajouter l'utilisateur
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const user = { id: mockUsers.length + 1, nom, login, mot_de_passe: hashedPassword, email };
    mockUsers.push(user);

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: user.id });
  });

  app.post('/login', async (req, res) => {
    const { login, mot_de_passe } = req.body;

    if (!login || !mot_de_passe) {
      return res.status(400).json({ error: 'Login et mot de passe requis' });
    }

    const user = mockUsers.find(u => u.login === login);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign({ userId: user.id, login: user.login }, 'test-secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, nom: user.nom, login: user.login } });
  });

  app.get('/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      const decoded = jwt.verify(token, 'test-secret');
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
    }
  });

  return app;
};

describe('🔐 Auth Service Tests', () => {
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
        service: 'auth-service'
      });
    });

    test('📈 GET /metrics should return auth metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('auth_requests_total');
    });
  });

  describe('👤 User Registration', () => {
    test('✅ Should register a new user', async () => {
      const userData = {
        nom: 'Cinéma Test',
        login: 'test_cinema',
        mot_de_passe: 'password123',
        email: 'test@cinema.fr'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.userId).toBeDefined();
    });

    test('❌ Should reject registration with missing fields', async () => {
      const userData = {
        nom: 'Cinéma Test',
        login: 'test_cinema'
        // Missing password and email
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Tous les champs sont requis');
    });
  });

  describe('🔑 User Login', () => {
    test('✅ Should login with valid credentials', async () => {
      // First register a user
      await request(app)
        .post('/register')
        .send({
          nom: 'Cinéma Login Test',
          login: 'login_test',
          mot_de_passe: 'password123',
          email: 'login@cinema.fr'
        });

      // Then login
      const response = await request(app)
        .post('/login')
        .send({
          login: 'login_test',
          mot_de_passe: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.login).toBe('login_test');
    });

    test('❌ Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          login: 'wrong_user',
          mot_de_passe: 'wrong_password'
        })
        .expect(401);

      expect(response.body.error).toBe('Identifiants invalides');
    });
  });

  describe('🔍 Token Verification', () => {
    test('✅ Should verify valid token', async () => {
      // Create a test token
      const token = jwt.sign({ userId: 1, login: 'test' }, 'test-secret', { expiresIn: '1h' });

      const response = await request(app)
        .get('/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user.login).toBe('test');
    });

    test('❌ Should reject missing token', async () => {
      const response = await request(app)
        .get('/verify')
        .expect(401);

      expect(response.body.error).toBe('Token manquant');
    });
  });
}); 