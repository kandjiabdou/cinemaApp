const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:araZxuHA4wBMkBc9@db.jaapsatmokzdmbckokbd.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;