const fs = require('fs');
const path = require('path');
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
    'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // Les Évadés
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar 2
    'https://image.tmdb.org/t/p/w500/w6aOKA1NwpnOMPrdKOB6kPMAcWx.jpg', // Intouchables
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight 2
    'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg', // Coco
    'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', // Joker 2
    'https://image.tmdb.org/t/p/w500/kmcqlZGaSh20zpTbuoF0Cdn07dT.jpg', // Avatar
    'https://image.tmdb.org/t/p/w500/uDO8zWDhfWkoFdKS4fzkUJt0Rf0.jpg', // La La Land
    'https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg', // La La Land alt
    'https://image.tmdb.org/t/p/w500/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg'  // Get Out
];

async function runCompleteMigration() {
    const client = await pool.connect();
    try {
        console.log('🚀 Début de la migration complète de la base de données...');
        
        // Démarrer une transaction globale
        await client.query('BEGIN');

        // ÉTAPE 1: Mise à jour de la structure des tables
        console.log('📋 ÉTAPE 1: Mise à jour de la structure des tables...');
        
        // Mise à jour des colonnes Cinema
        console.log('  - Ajout des colonnes manquantes à la table Cinema...');
        await client.query(`
            ALTER TABLE cinema
            ADD COLUMN IF NOT EXISTS code_postal VARCHAR(10),
            ADD COLUMN IF NOT EXISTS telephone VARCHAR(20);
        `);

        // Mise à jour des colonnes Film
        console.log('  - Optimisation des colonnes de la table Film...');
        await client.query(`
            ALTER TABLE Film
                ALTER COLUMN titre TYPE VARCHAR(255),
                ALTER COLUMN synopsis TYPE TEXT,
                ALTER COLUMN langue TYPE VARCHAR(50),
                ALTER COLUMN realisateur TYPE VARCHAR(255),
                ALTER COLUMN acteurs_principaux TYPE TEXT,
                ALTER COLUMN age_minimum TYPE VARCHAR(50),
                ALTER COLUMN genres TYPE TEXT,
                ALTER COLUMN poster TYPE VARCHAR(500);
        `);

        // ÉTAPE 2: Mise à jour des données existantes
        console.log('📝 ÉTAPE 2: Mise à jour des données existantes...');
        
        await client.query(`
            UPDATE cinema
            SET 
                code_postal = COALESCE(code_postal, '75000'),
                telephone = COALESCE(telephone, '01 00 00 00 00')
            WHERE code_postal IS NULL OR telephone IS NULL;
        `);

        // ÉTAPE 3: Ajout du cinéma manquant
        console.log('🏢 ÉTAPE 3: Ajout du cinéma Efrei...');
        
        await client.query(`
            INSERT INTO Cinema (id, nom, adresse, ville, login, mot_de_passe, email, code_postal, telephone) VALUES
            (3, 'Cinéma Efrei', '2 rue Albert Einstein', 'Villejuif', 'efrei_cinema', '$2b$10$8K1p/a0dqaillqh5/cqQUOYP4Y0vDk7OBeUsQJb0X4zKuOX2h9dCW', 'cinema@efrei.fr', '94800', '01 42 00 00 00')
            ON CONFLICT (id) DO NOTHING;
        `);

        // Réinitialiser la séquence des cinémas
        await client.query(`SELECT setval('cinema_id_seq', (SELECT MAX(id) FROM cinema));`);

        // ÉTAPE 4: Ajout des films supplémentaires
        console.log('🎬 ÉTAPE 4: Ajout des films supplémentaires...');
        
        const filmsToAdd = [
            // Films pour Cinéma Lumière
            ['Les Évadés', 142, 'Français', true, 'Frank Darabont', 'Tim Robbins, Morgan Freeman', 'Deux détenus tissent un lien fort dans une prison aux États-Unis.', '12+', 'Drame, Prison', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'],
            ['Interstellar', 169, 'Anglais', true, 'Christopher Nolan', 'Matthew McConaughey, Anne Hathaway', 'Un groupe d\'astronautes voyage à travers un trou de ver pour sauver l\'humanité.', '10+', 'Science-fiction, Drame', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'],
            ['Intouchables', 112, 'Français', false, 'Olivier Nakache, Éric Toledano', 'Omar Sy, François Cluzet', 'Un riche aristocrate engage un aide-soignant issu des quartiers populaires.', '10+', 'Comédie, Drame', 'https://image.tmdb.org/t/p/w500/w6aOKA1NwpnOMPrdKOB6kPMAcWx.jpg'],
            
            // Films pour Cinéma Étoile
            ['Parasite', 132, 'Coréen', true, 'Bong Joon-ho', 'Song Kang-ho, Lee Sun-kyun', 'Une famille pauvre s\'infiltre dans la vie d\'une famille riche.', '16+', 'Thriller, Drame', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'],
            ['The Dark Knight', 152, 'Anglais', true, 'Christopher Nolan', 'Christian Bale, Heath Ledger', 'Batman affronte le Joker, un criminel aussi brillant que dérangé.', '12+', 'Action, Thriller', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'],
            ['Coco', 105, 'Français', true, 'Lee Unkrich', 'Anthony Gonzalez, Gael García Bernal', 'Un jeune garçon passionné de musique voyage au pays des morts.', '0+', 'Animation, Famille', 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg'],
            
            // Films pour Cinéma Efrei
            ['Joker', 122, 'Anglais', true, 'Todd Phillips', 'Joaquin Phoenix, Robert De Niro', 'L\'histoire du célèbre ennemi de Batman, un comédien raté.', '16+', 'Drame, Psychologique', 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg'],
            ['Avatar', 162, 'Français', true, 'James Cameron', 'Sam Worthington, Zoe Saldana', 'Un marine paraplégique est envoyé sur une planète extraterrestre.', '10+', 'Science-fiction, Aventure', 'https://image.tmdb.org/t/p/w500/kmcqlZGaSh20zpTbuoF0Cdn07dT.jpg'],
            ['La La Land', 128, 'Anglais', true, 'Damien Chazelle', 'Emma Stone, Ryan Gosling', 'Un musicien et une actrice en herbe tombent amoureux à Los Angeles.', '10+', 'Musical, Romance', 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWkoFdKS4fzkUJt0Rf0.jpg']
        ];

        for (const film of filmsToAdd) {
            await client.query(`
                INSERT INTO film (titre, duree, langue, sous_titres, realisateur, acteurs_principaux, synopsis, age_minimum, genres, poster) VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, film);
        }

        console.log(`  - ${filmsToAdd.length} films ajoutés avec succès`);

        // ÉTAPE 5: Ajout des programmations
        console.log('📅 ÉTAPE 5: Ajout des programmations...');
        
        const programmations = [
            // Cinéma Lumière (ID 1) - Films 3, 4, 5
            [3, 1, '2025-06-01', '2025-06-20', 'Mardi', 'Jeudi', 'Samedi', '19:00:00'],
            [4, 1, '2025-06-03', '2025-06-22', 'Mercredi', 'Vendredi', 'Dimanche', '20:45:00'],
            [5, 1, '2025-06-05', '2025-06-25', 'Lundi', 'Jeudi', 'Samedi', '17:30:00'],
            
            // Cinéma Étoile (ID 2) - Films 6, 7, 8
            [6, 2, '2025-06-02', '2025-06-21', 'Mardi', 'Vendredi', 'Dimanche', '21:00:00'],
            [7, 2, '2025-06-04', '2025-06-24', 'Lundi', 'Mercredi', 'Samedi', '20:30:00'],
            [8, 2, '2025-06-06', '2025-06-26', 'Mardi', 'Jeudi', 'Samedi', '15:00:00'],
            
            // Cinéma Efrei (ID 3) - Films 9, 10, 11
            [9, 3, '2025-06-07', '2025-06-27', 'Lundi', 'Jeudi', 'Vendredi', '22:00:00'],
            [10, 3, '2025-06-08', '2025-06-28', 'Mardi', 'Mercredi', 'Dimanche', '19:15:00'],
            [11, 3, '2025-06-09', '2025-06-29', 'Mercredi', 'Samedi', 'Dimanche', '18:00:00']
        ];

        for (const prog of programmations) {
            await client.query(`
                INSERT INTO programmation (filmid, cinemaid, date_debut, date_fin, jour_1, jour_2, jour_3, heure_debut) VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8)
            `, prog);
        }

        console.log(`  - ${programmations.length} programmations ajoutées avec succès`);

        // ÉTAPE 6: Mise à jour des posters avec des images de qualité
        console.log('🖼️  ÉTAPE 6: Mise à jour des posters de films...');
        
        const { rows: films } = await client.query('SELECT id FROM Film ORDER BY id');
        let postersUpdated = 0;

        for (let i = 0; i < films.length; i++) {
            const filmId = films[i].id;
            const posterUrl = filmPosters[i % filmPosters.length];

            await client.query(
                'UPDATE Film SET poster = $1 WHERE id = $2',
                [posterUrl, filmId]
            );
            postersUpdated++;
        }

        console.log(`  - ${postersUpdated} posters mis à jour avec succès`);

        // Valider la transaction
        await client.query('COMMIT');
        
        console.log('✅ Migration complète terminée avec succès !');
        console.log('📊 Résumé:');
        console.log(`   - Structure des tables mise à jour`);
        console.log(`   - 1 cinéma ajouté (Cinéma Efrei)`);
        console.log(`   - ${filmsToAdd.length} films ajoutés`);
        console.log(`   - ${programmations.length} programmations créées`);
        console.log(`   - ${postersUpdated} posters mis à jour`);

    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('❌ Erreur lors de la migration complète:', error);
        throw error;
    } finally {
        // Libérer le client
        client.release();
    }
}

// Exécuter la migration complète
runCompleteMigration()
    .then(() => {
        console.log('🎉 Migration complétée avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Erreur lors de la migration complète:', error);
        process.exit(1);
    }); 