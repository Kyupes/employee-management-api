require('dotenv').config();

console.log(process.env.DATABASE_URL);
module.exports = {
    url: process.env.DATABASE_URL,
    dir: 'migrations',
    migrationsTable: 'pgmigrations',
};