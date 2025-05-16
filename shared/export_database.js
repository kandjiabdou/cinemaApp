const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function exportDatabase() {
    const client = await pool.connect();
    try {
        // Démarrer une transaction
        await client.query('BEGIN');

        // Récupérer la liste des tables
        const { rows: tables } = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        let sqlContent = '-- Export de la base de données\n\n';
        sqlContent += '-- Suppression des tables existantes\n';
        sqlContent += 'DROP TABLE IF EXISTS Programmation CASCADE;\n';
        sqlContent += 'DROP TABLE IF EXISTS Film CASCADE;\n';
        sqlContent += 'DROP TABLE IF EXISTS Cinema CASCADE;\n';
        sqlContent += 'DROP TABLE IF EXISTS Utilisateur CASCADE;\n\n';

        // Pour chaque table
        for (const table of tables) {
            const tableName = table.table_name;

            // Récupérer la structure de la table
            const { rows: columns } = await client.query(`
                SELECT column_name, data_type, character_maximum_length, 
                       is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [tableName]);

            // Récupérer les contraintes
            const { rows: constraints } = await client.query(`
                SELECT tc.constraint_name, tc.constraint_type, 
                       kcu.column_name, ccu.table_name AS foreign_table_name,
                       ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                LEFT JOIN information_schema.constraint_column_usage ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.table_name = $1
            `, [tableName]);

            // Générer le CREATE TABLE
            sqlContent += `-- Structure de la table ${tableName}\n`;
            sqlContent += `CREATE TABLE ${tableName} (\n`;
            
            // Colonnes
            const columnDefinitions = columns.map(col => {
                let def = `    ${col.column_name} ${col.data_type}`;
                if (col.character_maximum_length) {
                    def += `(${col.character_maximum_length})`;
                }
                if (col.column_default) {
                    def += ` DEFAULT ${col.column_default}`;
                }
                if (col.is_nullable === 'NO') {
                    def += ' NOT NULL';
                }
                return def;
            });

            // Contraintes de clé primaire
            const primaryKeys = constraints
                .filter(c => c.constraint_type === 'PRIMARY KEY')
                .map(c => c.column_name);
            
            if (primaryKeys.length > 0) {
                columnDefinitions.push(`    PRIMARY KEY (${primaryKeys.join(', ')})`);
            }

            sqlContent += columnDefinitions.join(',\n') + '\n);\n\n';

            // Contraintes de clé étrangère
            const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
            for (const fk of foreignKeys) {
                sqlContent += `ALTER TABLE ${tableName}\n`;
                sqlContent += `    ADD CONSTRAINT ${fk.constraint_name}\n`;
                sqlContent += `    FOREIGN KEY (${fk.column_name})\n`;
                sqlContent += `    REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n\n`;
            }

            // Récupérer les données
            const { rows: data } = await client.query(`SELECT * FROM ${tableName}`);
            
            if (data.length > 0) {
                sqlContent += `-- Données de la table ${tableName}\n`;
                for (const row of data) {
                    const columns = Object.keys(row);
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        return value;
                    });
                    
                    sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')})\n`;
                    sqlContent += `VALUES (${values.join(', ')});\n`;
                }
                sqlContent += '\n';
            }
        }

        // Écrire le fichier
        const filePath = path.join(__dirname, 'migrations', 'migration-bdd.sql');
        fs.writeFileSync(filePath, sqlContent);

        // Valider la transaction
        await client.query('COMMIT');
        console.log(`Export de la base de données terminé avec succès dans ${filePath}`);
    } catch (error) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('Erreur lors de l\'export de la base de données:', error);
        throw error;
    } finally {
        // Libérer le client
        client.release();
    }
}

// Exécuter l'export
exportDatabase()
    .then(() => {
        console.log('Export complété');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erreur lors de l\'export:', error);
        process.exit(1);
    }); 