const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runMigration() {
    const client = await pool.connect();
    try {
        // Démarrer une transaction
        await client.query('BEGIN');

        // Lire le fichier de migration
        const migrationPath = path.join(__dirname, 'migrations', 'insert_sample_data.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Exécuter la migration
        console.log('Exécution de la migration des données d\'exemple...');
        await client.query(migrationSQL);
        
        // Valider la transaction
        await client.query('COMMIT');
        console.log('Migration des données d\'exemple terminée avec succès !');
    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('Erreur lors de la migration des données d\'exemple:', error);
        throw error;
    } finally {
        // Libérer le client
        client.release();
    }
}

// Exécuter la migration
runMigration()
    .then(() => {
        console.log('Migration complétée');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erreur lors de la migration:', error);
        process.exit(1);
    }); 