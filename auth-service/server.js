const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./database');
const promClient = require('prom-client');

const app = express();
const PORT = 8100;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

// Configuration des métriques Prometheus
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées pour l'authentification
const authRequestsTotal = new promClient.Counter({
    name: 'auth_requests_total',
    help: 'Total number of authentication requests',
    labelNames: ['method', 'endpoint', 'status_code']
});

const authDuration = new promClient.Histogram({
    name: 'auth_request_duration_seconds',
    help: 'Authentication request duration in seconds',
    labelNames: ['method', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const authenticatedUsers = new promClient.Gauge({
    name: 'authenticated_users',
    help: 'Number of currently authenticated users'
});

const passwordAttempts = new promClient.Counter({
    name: 'password_attempts_total',
    help: 'Total number of password attempts',
    labelNames: ['status']
});

register.registerMetric(authRequestsTotal);
register.registerMetric(authDuration);
register.registerMetric(authenticatedUsers);
register.registerMetric(passwordAttempts);

// Configuration CORS détaillée
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware pour collecter les métriques
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const endpoint = req.path;
        
        authRequestsTotal.inc({
            method: req.method,
            endpoint: endpoint,
            status_code: res.statusCode
        });
        
        authDuration.observe({
            method: req.method,
            endpoint: endpoint
        }, duration);
    });
    
    next();
});

// Middleware de logging des requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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

// Route d'inscription
app.post('/register', async (req, res) => {
    try {
        const { 
            nom, 
            adresse, 
            ville, 
            login, 
            mot_de_passe, 
            email, 
            code_postal, 
            telephone 
        } = req.body;

        // Vérifier si le login existe déjà
        const { rows: existingUsers } = await pool.query(
            'SELECT * FROM Cinema WHERE login = $1',
            [login]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Ce login est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Insérer le nouveau cinéma
        const result = await pool.query(
            'INSERT INTO Cinema (nom, adresse, ville, login, mot_de_passe, email, code_postal, telephone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [nom, adresse, ville, login, hashedPassword, email, code_postal, telephone]
        );

        // Générer le token JWT
        const token = jwt.sign(
            { id: result.rows[0].id, login: login, role: 'cinema' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Incrémenter les métriques d'inscription
        authenticatedUsers.inc();

        res.status(201).json({ 
            message: 'Cinéma inscrit avec succès', 
            token,
            user: {
                id: result.rows[0].id,
                nom,
                login,
                email
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription: ' + error.message });
    }
});

// Route pour obtenir le profil du cinéma connecté
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.user.id, 10);

        const { rows: users } = await pool.query(
            'SELECT id, nom, adresse, ville, login, email FROM Cinema WHERE id = $1',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
});

// Route de connexion
app.post('/login', async (req, res) => {
    try {
        const { login, mot_de_passe } = req.body;

        // Vérifier les identifiants
        const { rows: users } = await pool.query(
            'SELECT * FROM Cinema WHERE login = $1',
            [login]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!validPassword) {
            passwordAttempts.inc({ status: 'failed' });
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        passwordAttempts.inc({ status: 'success' });

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, login: user.login, role: 'cinema' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nom: user.nom,
                login: user.login,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Route de vérification du token
app.get('/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Route de test pour connexion rapide
app.post('/test-login', async (req, res) => {
    try {
        // Récupérer le cinéma avec l'ID 1
        const { rows: users } = await pool.query(
            'SELECT * FROM Cinema WHERE id = 1'
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Cinéma de test non trouvé' });
        }

        const user = users[0];

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, login: user.login, role: 'cinema' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nom: user.nom,
                login: user.login,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion de test:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion de test' });
    }
});

// Endpoint pour les métriques Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(PORT, () => {
    console.log(`Service d'authentification running on port ${PORT}`);
}); 