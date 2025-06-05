const { Pool } = require('pg');

// Configuration adaptée à l'environnement
const isDocker = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;
const isLocal = !isDocker;

let poolConfig;

if (process.env.DATABASE_URL) {
    // Configuration Docker/Production avec variable d'environnement
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: false // Pas de SSL pour la base locale
    };
} else if (isLocal) {
    // Configuration locale pour développement
    poolConfig = {
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: 'postgres',
        database: 'cinema_db',
        ssl: false
    };
} else {
    // Fallback vers Supabase
    poolConfig = {
        connectionString: 'postgresql://postgres:araZxuHA4wBMkBc9@db.jaapsatmokzdmbckokbd.supabase.co:5432/postgres',
        ssl: {
            rejectUnauthorized: false
        }
    };
}

const pool = new Pool(poolConfig);

// Log de la configuration utilisée
console.log('Shared Database config:', {
    host: poolConfig.host || 'from connectionString',
    database: poolConfig.database || 'from connectionString',
    ssl: poolConfig.ssl
});

module.exports = pool;