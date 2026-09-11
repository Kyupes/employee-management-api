require('dotenv').config();

module.exports = {
    url: process.env.DATABASE_URL,
    dir: 'migrations',
    migrationsTable: 'pgmigrations',
};