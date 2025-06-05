const express = require('express');
const cors = require('cors');
const pool = require('./database');
const promClient = require('prom-client');

const app = express();
const PORT = 8300;

// Configuration des métriques Prometheus
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées pour le service public
const publicRequestsTotal = new promClient.Counter({
    name: 'public_requests_total',
    help: 'Total number of public service requests',
    labelNames: ['method', 'endpoint', 'status_code']
});

const publicRequestDuration = new promClient.Histogram({
    name: 'public_request_duration_seconds',
    help: 'Public service request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const searchQueriesTotal = new promClient.Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries'
});

const publicFilmsViewed = new promClient.Counter({
    name: 'public_films_viewed_total',
    help: 'Total number of films viewed by public users'
});

register.registerMetric(publicRequestsTotal);
register.registerMetric(publicRequestDuration);
register.registerMetric(searchQueriesTotal);
register.registerMetric(publicFilmsViewed);

app.use(cors());
app.use(express.json());

// Middleware pour collecter les métriques
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const endpoint = req.path;
        
        publicRequestsTotal.inc({
            method: req.method,
            endpoint: endpoint,
            status_code: res.statusCode
        });
        
        publicRequestDuration.observe({
            method: req.method,
            endpoint: endpoint
        }, duration);
        
        // Incrémenter les métriques spécifiques
        if (endpoint.includes('/recherche/')) {
            searchQueriesTotal.inc();
        }
        
        if (endpoint.includes('/films/') && req.method === 'GET') {
            publicFilmsViewed.inc();
        }
    });
    
    next();
});

// Route pour obtenir tous les films d'une ville
app.get('/films/ville/:ville', async (req, res) => {
    try {
        const { ville } = req.params;

        const { rows: films } = await pool.query(
            `SELECT DISTINCT f.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE c.ville = $1
            ORDER BY f.titre`,
            [ville]
        );

        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des films' });
    }
});

// Route pour obtenir tous les films
app.get('/films', async (req, res) => {
    try {
        const { rows: films } = await pool.query(
            `SELECT f.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Film f
            LEFT JOIN Programmation p ON f.id = p.filmid
            LEFT JOIN Cinema c ON p.cinemaid = c.id
            ORDER BY f.titre`
        );

        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des films' });
    }
});

// Route pour obtenir les détails d'un film spécifique
app.get('/films/:id', async (req, res) => {
    try {
        const filmId = parseInt(req.params.id, 10);

        // Récupérer les informations du film
        const { rows: films } = await pool.query(
            'SELECT * FROM Film WHERE id = $1',
            [filmId]
        );

        if (films.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        const film = films[0];

        // Récupérer les programmations du film
        const { rows: programmations } = await pool.query(
            `SELECT p.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Programmation p
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE p.filmid = $1
            ORDER BY p.date_debut`,
            [filmId]
        );

        // Formater la réponse
        const response = {
            ...film,
            programmations: programmations.map(prog => ({
                id: prog.id,
                date_debut: prog.date_debut,
                date_fin: prog.date_fin,
                jour_1: prog.jour_1,
                jour_2: prog.jour_2,
                jour_3: prog.jour_3,
                heure_debut: prog.heure_debut,
                cinema: {
                    nom: prog.cinema_nom,
                    adresse: prog.adresse,
                    ville: prog.ville
                }
            }))
        };

        res.json(response);
    } catch (error) {
        console.error('Erreur lors de la récupération du film:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du film' });
    }
});

// Route pour obtenir la liste des villes disponibles
app.get('/villes', async (req, res) => {
    try {
        const { rows: villes } = await pool.query(
            'SELECT DISTINCT ville FROM Cinema ORDER BY ville'
        );

        res.json(villes.map(v => v.ville));
    } catch (error) {
        console.error('Erreur lors de la récupération des villes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des villes' });
    }
});

// Route pour obtenir la liste des cinémas
app.get('/cinemas', async (req, res) => {
    try {
        const { rows: cinemas } = await pool.query(
            'SELECT id, nom, adresse, ville FROM Cinema ORDER BY ville, nom'
        );

        res.json(cinemas);
    } catch (error) {
        console.error('Erreur lors de la récupération des cinémas:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des cinémas' });
    }
});

// Route pour obtenir les films d'un cinéma spécifique
app.get('/cinemas/:cinemaId/films', async (req, res) => {
    try {
        const cinemaId = parseInt(req.params.cinemaId, 10);

        // Vérifier d'abord si le cinéma existe
        const { rows: cinemas } = await pool.query(
            'SELECT id FROM Cinema WHERE id = $1',
            [cinemaId]
        );

        if (cinemas.length === 0) {
            return res.status(404).json({ message: 'Cinéma non trouvé' });
        }

        const { rows: films } = await pool.query(
            `SELECT DISTINCT f.*
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            WHERE p.cinemaid = $1
            ORDER BY f.titre`,
            [cinemaId]
        );

        // Retourner un tableau vide si aucun film n'est trouvé
        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la récupération des films du cinéma:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des films du cinéma' });
    }
});

// Route pour obtenir un film spécifique d'un cinéma
app.get('/cinemas/:cinemaId/films/:filmId', async (req, res) => {
    try {
        const cinemaId = parseInt(req.params.cinemaId, 10);
        const filmId = parseInt(req.params.filmId, 10);

        // Vérifier si le film est programmé dans ce cinéma
        const { rows: films } = await pool.query(
            `SELECT f.*, p.date_debut, p.date_fin, p.jour_1, p.jour_2, p.jour_3, p.heure_debut
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            WHERE p.cinemaid = $1 AND f.id = $2`,
            [cinemaId, filmId]
        );

        if (films.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé dans ce cinéma' });
        }

        const film = films[0];

        // Formater la réponse avec les informations de programmation
        const response = {
            ...film,
            programmation: {
                date_debut: film.date_debut,
                date_fin: film.date_fin,
                jour_1: film.jour_1,
                jour_2: film.jour_2,
                jour_3: film.jour_3,
                heure_debut: film.heure_debut
            }
        };

        // Supprimer les champs de programmation du niveau supérieur
        delete response.date_debut;
        delete response.date_fin;
        delete response.jour_1;
        delete response.jour_2;
        delete response.jour_3;
        delete response.heure_debut;

        res.json(response);
    } catch (error) {
        console.error('Erreur lors de la récupération du film du cinéma:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du film du cinéma' });
    }
});

// Route pour rechercher des films
app.get('/films/recherche/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchQuery = `%${query}%`;

        const { rows: films } = await pool.query(
            `SELECT DISTINCT f.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE f.titre ILIKE $1
            OR f.realisateur ILIKE $1
            OR f.acteurs_principaux ILIKE $1
            OR f.genres ILIKE $1
            ORDER BY f.titre`,
            [searchQuery]
        );

        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la recherche des films:', error);
        res.status(500).json({ message: 'Erreur lors de la recherche des films' });
    }
});

// Endpoint pour les métriques Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(PORT, () => {
    console.log(`Service public running on port ${PORT}`);
}); 