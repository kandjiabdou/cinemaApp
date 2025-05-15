const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('../shared/database');

const app = express();
const PORT = 8100;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

app.use(cors());
app.use(express.json());

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
        const { nom, adresse, ville, login, mot_de_passe, email } = req.body;

        // Vérifier si le login existe déjà
        const [existingUsers] = await pool.query(
            'SELECT * FROM Cinema WHERE login = ?',
            [login]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Ce login est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Insérer le nouveau cinéma
        const [result] = await pool.query(
            'INSERT INTO Cinema (nom, adresse, ville, login, mot_de_passe, email) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, adresse, ville, login, hashedPassword, email]
        );

        res.status(201).json({ message: 'Cinéma inscrit avec succès', id: result.insertId });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
app.post('/login', async (req, res) => {
    try {
        const { login, mot_de_passe } = req.body;

        // Vérifier les identifiants
        const [users] = await pool.query(
            'SELECT * FROM Cinema WHERE login = ?',
            [login]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

        if (!validPassword) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

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

app.listen(PORT, () => {
    console.log(`Service d'authentification running on port ${PORT}`);
}); 