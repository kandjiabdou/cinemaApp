const express = require('express');
const cors = require('cors');
const pool = require('../shared/database');

const app = express();
const PORT = 8300;

app.use(cors());
app.use(express.json());

// Route pour obtenir tous les films d'une ville
app.get('/films/ville/:ville', async (req, res) => {
    try {
        const { ville } = req.params;

        const [films] = await pool.query(
            `SELECT DISTINCT f.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE c.ville = ?
            ORDER BY f.titre`,
            [ville]
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
        const filmId = req.params.id;

        // Récupérer les informations du film
        const [films] = await pool.query(
            'SELECT * FROM Film WHERE id = ?',
            [filmId]
        );

        if (films.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        const film = films[0];

        // Récupérer les programmations du film
        const [programmations] = await pool.query(
            `SELECT p.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Programmation p
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE p.filmid = ?
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
        const [villes] = await pool.query(
            'SELECT DISTINCT ville FROM Cinema ORDER BY ville'
        );

        res.json(villes.map(v => v.ville));
    } catch (error) {
        console.error('Erreur lors de la récupération des villes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des villes' });
    }
});

// Route pour rechercher des films
app.get('/films/recherche/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchQuery = `%${query}%`;

        const [films] = await pool.query(
            `SELECT DISTINCT f.*, c.nom as cinema_nom, c.adresse, c.ville
            FROM Film f
            JOIN Programmation p ON f.id = p.filmid
            JOIN Cinema c ON p.cinemaid = c.id
            WHERE f.titre LIKE ?
            OR f.realisateur LIKE ?
            OR f.acteurs_principaux LIKE ?
            OR f.genres LIKE ?
            ORDER BY f.titre`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        res.json(films);
    } catch (error) {
        console.error('Erreur lors de la recherche des films:', error);
        res.status(500).json({ message: 'Erreur lors de la recherche des films' });
    }
});

app.listen(PORT, () => {
    console.log(`Service public running on port ${PORT}`);
}); 