const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pool = require('./database');
const promClient = require('prom-client');

const app = express();
const PORT = 8200;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

// Configuration des métriques Prometheus
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées pour le service cinéma
const cinemaRequestsTotal = new promClient.Counter({
    name: 'cinema_requests_total',
    help: 'Total number of cinema service requests',
    labelNames: ['method', 'endpoint', 'status_code']
});

const cinemaRequestDuration = new promClient.Histogram({
    name: 'cinema_request_duration_seconds',
    help: 'Cinema service request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const filmsTotal = new promClient.Gauge({
    name: 'films_total',
    help: 'Total number of films managed'
});

const programmationsTotal = new promClient.Gauge({
    name: 'programmations_total',
    help: 'Total number of programmations'
});

register.registerMetric(cinemaRequestsTotal);
register.registerMetric(cinemaRequestDuration);
register.registerMetric(filmsTotal);
register.registerMetric(programmationsTotal);

// Configuration CORS détaillée
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Middleware pour collecter les métriques
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const endpoint = req.path;
        
        cinemaRequestsTotal.inc({
            method: req.method,
            endpoint: endpoint,
            status_code: res.statusCode
        });
        
        cinemaRequestDuration.observe({
            method: req.method,
            endpoint: endpoint
        }, duration);
    });
    
    next();
});

// Middleware de logging des requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', req.body);
    }
    next();
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Routes pour les films
// Route pour obtenir tous les films du cinéma
app.get('/films', authenticateToken, async (req, res) => {
    try {
        const cinemaid = parseInt(req.user.id, 10);
        const { rows: films } = await pool.query(
            `SELECT f.*
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            WHERE p.cinemaid = $1
            ORDER BY f.titre`,
            [cinemaid]
        );

        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des films' });
    }
});

// Route pour obtenir un film spécifique du cinéma
app.get('/films/:id', authenticateToken, async (req, res) => {
    try {
        const filmId = parseInt(req.params.id, 10);
        const cinemaid = parseInt(req.user.id, 10);

        const { rows: films } = await pool.query(
            `SELECT f.*
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            WHERE f.id = $1 AND p.cinemaid = $2`,
            [filmId, cinemaid]
        );

        if (films.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        res.json(films[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du film:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du film' });
    }
});

// Route pour obtenir toutes les programmations du cinéma
app.get('/programmations', authenticateToken, async (req, res) => {
    try {
        const cinemaid = parseInt(req.user.id, 10);
        const { rows: programmations } = await pool.query(
            `SELECT p.*, f.titre as film_titre
            FROM Programmation p
            JOIN Film f ON p.filmid = f.id
            WHERE p.cinemaid = $1
            ORDER BY p.date_debut, p.heure_debut`,
            [cinemaid]
        );

        res.json(programmations);
    } catch (error) {
        console.error('Erreur lors de la récupération des programmations:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des programmations' });
    }
});

// Route pour obtenir une programmation spécifique
app.get('/programmations/:id', authenticateToken, async (req, res) => {
    try {
        const programmationId = parseInt(req.params.id, 10);
        const cinemaid = parseInt(req.user.id, 10);

        const { rows: programmations } = await pool.query(
            `SELECT p.*, f.titre as film_titre
            FROM Programmation p
            JOIN Film f ON p.filmid = f.id
            WHERE p.id = $1 AND p.cinemaid = $2`,
            [programmationId, cinemaid]
        );

        if (programmations.length === 0) {
            return res.status(404).json({ message: 'Programmation non trouvée' });
        }

        res.json(programmations[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la programmation' });
    }
});

app.post('/films', authenticateToken, upload.single('poster'), async (req, res) => {
    const client = await pool.connect();
    try {
        // Démarrer une transaction
        await client.query('BEGIN');

        const {
            titre,
            duree,
            langue,
            sous_titres,
            realisateur,
            acteurs_principaux,
            synopsis,
            age_minimum,
            genres,
            // Nouveaux champs pour la programmation
            date_debut,
            date_fin,
            jour_1,
            jour_2,
            jour_3,
            heure_debut
        } = req.body;

        const cinemaid = parseInt(req.user.id, 10);
        const poster = req.file ? `/uploads/${req.file.filename}` : 'https://m.media-amazon.com/images/I/613ypTLZHsL._SY445_.jpg';

        // 1. Insérer le film
        const filmResult = await client.query(
            `INSERT INTO Film (
                titre, duree, langue, sous_titres, realisateur,
                acteurs_principaux, synopsis, age_minimum, genres, poster
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [
                titre, duree, langue, sous_titres, realisateur,
                acteurs_principaux, synopsis, age_minimum, genres, poster
            ]
        );

        const filmId = filmResult.rows[0].id;

        // 2. Créer automatiquement une programmation pour ce film
        const programmationResult = await client.query(
            `INSERT INTO Programmation (
                filmid, cinemaid, date_debut, date_fin,
                jour_1, jour_2, jour_3, heure_debut
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                filmId,
                cinemaid,
                date_debut || '2024-03-20', // Date de début par défaut si non fournie
                date_fin || '2024-04-20',   // Date de fin par défaut si non fournie
                jour_1 || true,             // Par défaut, tous les jours sont programmés
                jour_2 || true,
                jour_3 || true,
                heure_debut || '20:00'      // Heure de début par défaut
            ]
        );

        // Valider la transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Film et programmation ajoutés avec succès',
            filmId: filmId,
            programmationId: programmationResult.rows[0].id
        });
    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('Erreur lors de l\'ajout du film et de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du film et de la programmation' });
    } finally {
        // Libérer le client
        client.release();
    }
});

// Route pour mettre à jour un film
app.put('/films/:id', authenticateToken, upload.single('poster'), async (req, res) => {
    try {
        const filmId = parseInt(req.params.id, 10);
        const filmid = parseInt(req.body.filmid, 10);
        const {
            titre,
            duree,
            langue,
            sous_titres,
            realisateur,
            acteurs_principaux,
            synopsis,
            age_minimum,
            genres
        } = req.body;

        let poster = undefined;
        if (req.file) {
            poster = `/uploads/${req.file.filename}`;
        }

        const updateFields = [];
        const updateValues = [];

        if (titre) {
            updateFields.push(`titre = $${updateValues.length + 1}`);
            updateValues.push(titre);
        }
        if (duree) {
            updateFields.push(`duree = $${updateValues.length + 1}`);
            updateValues.push(duree);
        }
        if (langue) {
            updateFields.push(`langue = $${updateValues.length + 1}`);
            updateValues.push(langue);
        }
        if (sous_titres !== undefined) {
            updateFields.push(`sous_titres = $${updateValues.length + 1}`);
            updateValues.push(sous_titres);
        }
        if (realisateur) {
            updateFields.push(`realisateur = $${updateValues.length + 1}`);
            updateValues.push(realisateur);
        }
        if (acteurs_principaux) {
            updateFields.push(`acteurs_principaux = $${updateValues.length + 1}`);
            updateValues.push(acteurs_principaux);
        }
        if (synopsis) {
            updateFields.push(`synopsis = $${updateValues.length + 1}`);
            updateValues.push(synopsis);
        }
        if (age_minimum) {
            updateFields.push(`age_minimum = $${updateValues.length + 1}`);
            updateValues.push(age_minimum);
        }
        if (genres) {
            updateFields.push(`genres = $${updateValues.length + 1}`);
            updateValues.push(genres);
        }
        if (poster) {
            updateFields.push(`poster = $${updateValues.length + 1}`);
            updateValues.push(poster);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
        }

        updateValues.push(filmId);

        const result = await pool.query(
            `UPDATE Film SET ${updateFields.join(', ')} WHERE id = $${updateValues.length} RETURNING id`,
            updateValues
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        res.json({ message: 'Film mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du film:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du film' });
    }
});

// Routes pour les programmations
app.post('/programmations', authenticateToken, async (req, res) => {
    try {
        const {
            filmid,
            date_debut,
            date_fin,
            jour_1,
            jour_2,
            jour_3,
            heure_debut
        } = req.body;

        const cinemaid = parseInt(req.user.id, 10);

        const result = await pool.query(
            `INSERT INTO Programmation (
                filmid, cinemaid, date_debut, date_fin,
                jour_1, jour_2, jour_3, heure_debut
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                filmid, cinemaid, date_debut, date_fin,
                jour_1, jour_2, jour_3, heure_debut
            ]
        );

        res.status(201).json({
            message: 'Programmation ajoutée avec succès',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la programmation' });
    }
});

// Route pour mettre à jour une programmation
app.put('/programmations/:id', authenticateToken, async (req, res) => {
    try {
        const programmationId = parseInt(req.params.id, 10);
        const {
            date_debut,
            date_fin,
            jour_1,
            jour_2,
            jour_3,
            heure_debut
        } = req.body;

        const cinemaid = parseInt(req.user.id, 10);

        // Vérifier que la programmation appartient bien au cinéma
        const { rows: programmations } = await pool.query(
            'SELECT * FROM Programmation WHERE id = $1 AND cinemaid = $2',
            [programmationId, cinemaid]
        );

        if (programmations.length === 0) {
            return res.status(404).json({ message: 'Programmation non trouvée' });
        }

        const result = await pool.query(
            `UPDATE Programmation SET
                date_debut = $1,
                date_fin = $2,
                jour_1 = $3,
                jour_2 = $4,
                jour_3 = $5,
                heure_debut = $6
            WHERE id = $7 AND cinemaid = $8`,
            [
                date_debut,
                date_fin,
                jour_1,
                jour_2,
                jour_3,
                heure_debut,
                programmationId,
                cinemaid
            ]
        );

        res.json({ message: 'Programmation mise à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la programmation' });
    }
});

// Route pour supprimer une programmation
app.delete('/programmations/:id', authenticateToken, async (req, res) => {
    try {
        const programmationId = parseInt(req.params.id, 10);
        const cinemaid = parseInt(req.user.id, 10);

        const result = await pool.query(
            'DELETE FROM Programmation WHERE id = $1 AND cinemaid = $2',
            [programmationId, cinemaid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Programmation non trouvée' });
        }

        res.json({ message: 'Programmation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la programmation' });
    }
});

// Endpoint pour les métriques Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(PORT, () => {
    console.log(`Service de gestion des cinémas running on port ${PORT}`);
}); 