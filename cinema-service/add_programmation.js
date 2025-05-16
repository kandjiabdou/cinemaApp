const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'votre_secret_jwt_super_securise';
const CINEMA_ID = 3; // Votre ID de cinéma

// Créer un token JWT pour l'authentification
const token = jwt.sign({ id: CINEMA_ID }, JWT_SECRET);

// Configuration de l'API
const api = axios.create({
    baseURL: 'http://localhost:8000/cinema',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

async function addProgrammation(filmId) {
    try {
        const programmation = {
            filmid: filmId,
            date_debut: '2024-03-20', // Date de début
            date_fin: '2024-04-20',   // Date de fin
            jour_1: true,             // Lundi
            jour_2: true,             // Mardi
            jour_3: true,             // Mercredi
            heure_debut: '20:00'      // Heure de début
        };

        const response = await api.post('/programmations', programmation);
        console.log('Programmation ajoutée avec succès:', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la programmation:', error.response?.data || error.message);
    }
}

// Exemple d'utilisation : ajouter une programmation pour le film avec l'ID 1
addProgrammation(1); 