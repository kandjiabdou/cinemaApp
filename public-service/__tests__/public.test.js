const request = require('supertest');
const express = require('express');

// Mock simple du serveur pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock database avec quelques données de test
  const mockFilms = [
    { id: 1, titre: 'Film Test 1', ville: 'Paris', duree: 120, langue: 'Français', genres: 'Action' },
    { id: 2, titre: 'Film Test 2', ville: 'Lyon', duree: 90, langue: 'Anglais', genres: 'Comédie' },
    { id: 3, titre: 'Film Test 3', ville: 'Paris', duree: 150, langue: 'Français', genres: 'Drame' }
  ];

  const mockCinemas = [
    { id: 1, nom: 'Cinéma Test Paris', ville: 'Paris' },
    { id: 2, nom: 'Cinéma Test Lyon', ville: 'Lyon' }
  ];

  // Routes de test
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'public-service' });
  });

  app.get('/metrics', (req, res) => {
    res.status(200).send('# HELP public metrics\npublic_requests_total 1\n');
  });

  // Route pour obtenir tous les films
  app.get('/films', (req, res) => {
    res.json(mockFilms);
  });

  // Route pour obtenir les films par ville
  app.get('/films/ville/:ville', (req, res) => {
    const ville = req.params.ville;
    const filmsParVille = mockFilms.filter(film => 
      film.ville.toLowerCase() === ville.toLowerCase()
    );
    res.json(filmsParVille);
  });

  // Route pour obtenir un film par ID
  app.get('/films/:id', (req, res) => {
    const filmId = parseInt(req.params.id);
    const film = mockFilms.find(f => f.id === filmId);
    
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }
    
    res.json(film);
  });

  // Route pour rechercher des films
  app.get('/films/recherche/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const filmsResults = mockFilms.filter(film => 
      film.titre.toLowerCase().includes(query) ||
      film.genres.toLowerCase().includes(query)
    );
    res.json(filmsResults);
  });

  // Route pour obtenir toutes les villes
  app.get('/villes', (req, res) => {
    const villes = [...new Set(mockCinemas.map(cinema => cinema.ville))];
    res.json(villes);
  });

  // Route pour obtenir les cinémas
  app.get('/cinemas', (req, res) => {
    res.json(mockCinemas);
  });

  // Route pour obtenir les cinémas par ville
  app.get('/cinemas/ville/:ville', (req, res) => {
    const ville = req.params.ville;
    const cinemasParVille = mockCinemas.filter(cinema => 
      cinema.ville.toLowerCase() === ville.toLowerCase()
    );
    res.json(cinemasParVille);
  });

  return app;
};

describe('🌐 Public Service Tests', () => {
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
        service: 'public-service'
      });
    });

    test('📈 GET /metrics should return public metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('public_requests_total');
    });
  });

  describe('🎬 Films Endpoints', () => {
    test('✅ Should get all films', async () => {
      const response = await request(app)
        .get('/films')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('✅ Should get films by city', async () => {
      const response = await request(app)
        .get('/films/ville/Paris')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(film => {
        expect(film.ville).toBe('Paris');
      });
    });

    test('✅ Should get film by ID', async () => {
      const response = await request(app)
        .get('/films/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.titre).toBe('Film Test 1');
    });

    test('❌ Should return 404 for non-existent film', async () => {
      const response = await request(app)
        .get('/films/999')
        .expect(404);

      expect(response.body.error).toBe('Film non trouvé');
    });

    test('✅ Should search films by title', async () => {
      const response = await request(app)
        .get('/films/recherche/test')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(film => {
        expect(film.titre.toLowerCase()).toContain('test');
      });
    });

    test('✅ Should search films by genre', async () => {
      const response = await request(app)
        .get('/films/recherche/action')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(film => {
        expect(film.genres.toLowerCase()).toContain('action');
      });
    });
  });

  describe('🏢 Cinemas & Cities Endpoints', () => {
    test('✅ Should get all cities', async () => {
      const response = await request(app)
        .get('/villes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toContain('Paris');
      expect(response.body).toContain('Lyon');
    });

    test('✅ Should get all cinemas', async () => {
      const response = await request(app)
        .get('/cinemas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('✅ Should get cinemas by city', async () => {
      const response = await request(app)
        .get('/cinemas/ville/Paris')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(cinema => {
        expect(cinema.ville).toBe('Paris');
      });
    });

    test('✅ Should return empty array for city with no cinemas', async () => {
      const response = await request(app)
        .get('/cinemas/ville/Marseille')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('❌ Error Handling', () => {
    test('Should handle invalid film ID format', async () => {
      await request(app)
        .get('/films/invalid')
        .expect(404);
    });

    test('Should handle empty search query', async () => {
      const response = await request(app)
        .get('/films/recherche/')
        .expect(404);
    });
  });
}); 