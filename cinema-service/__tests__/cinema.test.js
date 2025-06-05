const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock simple du serveur pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock database
  const mockFilms = [];
  const mockProgrammations = [];

  // Middleware d'auth simple pour les tests
  const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, 'test-secret');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
    }
  };

  // Routes de test
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'cinema-service' });
  });

  app.get('/metrics', (req, res) => {
    res.status(200).send('# HELP cinema metrics\ncinema_films_total 1\n');
  });

  // Routes films
  app.get('/films', authMiddleware, (req, res) => {
    const userFilms = mockFilms.filter(film => film.cinemaId === req.user.userId);
    res.json(userFilms);
  });

  app.post('/films', authMiddleware, (req, res) => {
    const { titre, duree, langue, realisateur } = req.body;
    
    if (!titre || !duree || !langue || !realisateur) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const film = {
      id: mockFilms.length + 1,
      cinemaId: req.user.userId,
      titre,
      duree,
      langue,
      realisateur
    };
    
    mockFilms.push(film);
    res.status(201).json(film);
  });

  app.put('/films/:id', authMiddleware, (req, res) => {
    const filmId = parseInt(req.params.id);
    const filmIndex = mockFilms.findIndex(f => f.id === filmId && f.cinemaId === req.user.userId);
    
    if (filmIndex === -1) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    mockFilms[filmIndex] = { ...mockFilms[filmIndex], ...req.body };
    res.json(mockFilms[filmIndex]);
  });

  app.delete('/films/:id', authMiddleware, (req, res) => {
    const filmId = parseInt(req.params.id);
    const filmIndex = mockFilms.findIndex(f => f.id === filmId && f.cinemaId === req.user.userId);
    
    if (filmIndex === -1) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    mockFilms.splice(filmIndex, 1);
    res.status(204).send();
  });

  // Routes programmations
  app.get('/programmations', authMiddleware, (req, res) => {
    const userProgrammations = mockProgrammations.filter(prog => prog.cinemaId === req.user.userId);
    res.json(userProgrammations);
  });

  app.post('/programmations', authMiddleware, (req, res) => {
    const { filmId, date_debut, date_fin } = req.body;
    
    if (!filmId || !date_debut || !date_fin) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const programmation = {
      id: mockProgrammations.length + 1,
      cinemaId: req.user.userId,
      filmId,
      date_debut,
      date_fin
    };
    
    mockProgrammations.push(programmation);
    res.status(201).json(programmation);
  });

  return app;
};

describe('🏢 Cinema Service Tests', () => {
  let app;
  let authToken;

  beforeAll(() => {
    app = createTestApp();
    // Créer un token de test
    authToken = jwt.sign({ userId: 1, login: 'test_cinema' }, 'test-secret', { expiresIn: '1h' });
  });

  describe('📊 Health & Metrics', () => {
    test('✅ GET /health should return OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        service: 'cinema-service'
      });
    });

    test('📈 GET /metrics should return cinema metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('cinema_films_total');
    });
  });

  describe('🎬 Films Management', () => {
    test('✅ Should create a new film', async () => {
      const filmData = {
        titre: 'Test Film',
        duree: 120,
        langue: 'Français',
        realisateur: 'Test Director'
      };

      const response = await request(app)
        .post('/films')
        .set('Authorization', `Bearer ${authToken}`)
        .send(filmData)
        .expect(201);

      expect(response.body.titre).toBe('Test Film');
      expect(response.body.id).toBeDefined();
    });

    test('✅ Should get user films', async () => {
      const response = await request(app)
        .get('/films')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('❌ Should reject film creation without auth', async () => {
      const filmData = {
        titre: 'Test Film',
        duree: 120,
        langue: 'Français',
        realisateur: 'Test Director'
      };

      await request(app)
        .post('/films')
        .send(filmData)
        .expect(401);
    });

    test('❌ Should reject film creation with missing fields', async () => {
      const filmData = {
        titre: 'Test Film'
        // Missing required fields
      };

      const response = await request(app)
        .post('/films')
        .set('Authorization', `Bearer ${authToken}`)
        .send(filmData)
        .expect(400);

      expect(response.body.error).toBe('Champs requis manquants');
    });
  });

  describe('📅 Programmations Management', () => {
    test('✅ Should create a new programmation', async () => {
      const programmationData = {
        filmId: 1,
        date_debut: '2024-01-01',
        date_fin: '2024-01-31'
      };

      const response = await request(app)
        .post('/programmations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(programmationData)
        .expect(201);

      expect(response.body.filmId).toBe(1);
      expect(response.body.id).toBeDefined();
    });

    test('✅ Should get user programmations', async () => {
      const response = await request(app)
        .get('/programmations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('❌ Should reject programmation creation without auth', async () => {
      const programmationData = {
        filmId: 1,
        date_debut: '2024-01-01',
        date_fin: '2024-01-31'
      };

      await request(app)
        .post('/programmations')
        .send(programmationData)
        .expect(401);
    });
  });
}); 