const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pool = require('../shared/database');

const app = express();
const PORT = 8200;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

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

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
app.post('/films', authenticateToken, upload.single('poster'), async (req, res) => {
    try {
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

        const poster = req.file ? `/uploads/${req.file.filename}` : '/images/default-poster.jpg';

        const [result] = await pool.query(
            `INSERT INTO Film (
                titre, duree, langue, sous_titres, realisateur,
                acteurs_principaux, synopsis, age_minimum, genres, poster
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titre, duree, langue, sous_titres, realisateur,
                acteurs_principaux, synopsis, age_minimum, genres, poster
            ]
        );

        res.status(201).json({
            message: 'Film ajouté avec succès',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du film:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du film' });
    }
});

// Route pour mettre à jour un film
app.put('/films/:id', authenticateToken, upload.single('poster'), async (req, res) => {
    try {
        const filmId = req.params.id;
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
            updateFields.push('titre = ?');
            updateValues.push(titre);
        }
        if (duree) {
            updateFields.push('duree = ?');
            updateValues.push(duree);
        }
        if (langue) {
            updateFields.push('langue = ?');
            updateValues.push(langue);
        }
        if (sous_titres !== undefined) {
            updateFields.push('sous_titres = ?');
            updateValues.push(sous_titres);
        }
        if (realisateur) {
            updateFields.push('realisateur = ?');
            updateValues.push(realisateur);
        }
        if (acteurs_principaux) {
            updateFields.push('acteurs_principaux = ?');
            updateValues.push(acteurs_principaux);
        }
        if (synopsis) {
            updateFields.push('synopsis = ?');
            updateValues.push(synopsis);
        }
        if (age_minimum) {
            updateFields.push('age_minimum = ?');
            updateValues.push(age_minimum);
        }
        if (genres) {
            updateFields.push('genres = ?');
            updateValues.push(genres);
        }
        if (poster) {
            updateFields.push('poster = ?');
            updateValues.push(poster);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
        }

        updateValues.push(filmId);

        const [result] = await pool.query(
            `UPDATE Film SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
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

        const cinemaid = req.user.id;

        const [result] = await pool.query(
            `INSERT INTO Programmation (
                filmid, cinemaid, date_debut, date_fin,
                jour_1, jour_2, jour_3, heure_debut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                filmid, cinemaid, date_debut, date_fin,
                jour_1, jour_2, jour_3, heure_debut
            ]
        );

        res.status(201).json({
            message: 'Programmation ajoutée avec succès',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la programmation' });
    }
});

// Route pour mettre à jour une programmation
app.put('/programmations/:id', authenticateToken, async (req, res) => {
    try {
        const programmationId = req.params.id;
        const {
            date_debut,
            date_fin,
            jour_1,
            jour_2,
            jour_3,
            heure_debut
        } = req.body;

        const cinemaid = req.user.id;

        // Vérifier que la programmation appartient bien au cinéma
        const [programmations] = await pool.query(
            'SELECT * FROM Programmation WHERE id = ? AND cinemaid = ?',
            [programmationId, cinemaid]
        );

        if (programmations.length === 0) {
            return res.status(404).json({ message: 'Programmation non trouvée' });
        }

        const [result] = await pool.query(
            `UPDATE Programmation SET
                date_debut = ?,
                date_fin = ?,
                jour_1 = ?,
                jour_2 = ?,
                jour_3 = ?,
                heure_debut = ?
            WHERE id = ? AND cinemaid = ?`,
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
        const programmationId = req.params.id;
        const cinemaid = req.user.id;

        const [result] = await pool.query(
            'DELETE FROM Programmation WHERE id = ? AND cinemaid = ?',
            [programmationId, cinemaid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Programmation non trouvée' });
        }

        res.json({ message: 'Programmation supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la programmation:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la programmation' });
    }
});

app.listen(PORT, () => {
    console.log(`Service de gestion des cinémas running on port ${PORT}`);
}); 