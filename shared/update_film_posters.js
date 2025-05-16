const pool = require('./database');

// Liste d'URLs d'images de films populaires (format poster TMDB)
const filmPosters = [
    'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Inception
    'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg', // Interstellar
    'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', // The Dark Knight
    'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', // The Shawshank Redemption
    'https://image.tmdb.org/t/p/w500/lyPm3QwTVDhYO3hA3xoARu8VZeW.jpg', // Pulp Fiction
    'https://image.tmdb.org/t/p/w500/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg', // The Godfather
    'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', // The Matrix
    'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', // Avengers: Endgame
    'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg', // Parasite
    'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Joker
    'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg', // The Lion King
    'https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', // Spider-Man: Into the Spider-Verse
    'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', // The Social Network
    'https://image.tmdb.org/t/p/w500/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg', // The Grand Budapest Hotel
    'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg', // La La Land
    'https://image.tmdb.org/t/p/w500/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg', // Get Out
    'https://image.tmdb.org/t/p/w500/7W0G3YECgDAfnuiHG91r8WqgIOe.jpg', // Blade Runner 2049
    'https://image.tmdb.org/t/p/w500/2v9FVVBUrrkW2m3QOcYkuhq9A6o.jpg', // Dunkirk
    'https://image.tmdb.org/t/p/w500/4EYPN5mVIhKLfxGruy7Dy41dTVn.jpg', // The Shape of Water
    'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'  // Three Billboards Outside Ebbing, Missouri
];

async function updateFilmPosters() {
    const client = await pool.connect();
    try {
        // Démarrer une transaction
        await client.query('BEGIN');

        // Récupérer tous les films
        const { rows: films } = await client.query('SELECT id FROM Film ORDER BY id');

        // Mettre à jour chaque film avec une image aléatoire
        for (let i = 0; i < films.length; i++) {
            const filmId = films[i].id;
            const posterUrl = filmPosters[i % filmPosters.length]; // Utilise l'index modulo pour boucler sur les images

            await client.query(
                'UPDATE Film SET poster = $1 WHERE id = $2',
                [posterUrl, filmId]
            );

            console.log(`Film ${filmId} mis à jour avec l'image: ${posterUrl}`);
        }

        // Valider la transaction
        await client.query('COMMIT');
        console.log('Mise à jour des posters terminée avec succès !');
    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour des posters:', error);
        throw error;
    } finally {
        // Libérer le client
        client.release();
    }
}

// Exécuter la mise à jour
updateFilmPosters()
    .then(() => {
        console.log('Mise à jour complétée');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erreur lors de la mise à jour:', error);
        process.exit(1);
    }); 