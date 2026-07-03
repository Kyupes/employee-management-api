import { pool } from '../../src/config/db';

export async function clearDatabase() {
    await pool.query('TRUNCATE TABLE employees, users RESTART IDENTITY CASCADE');
}

export async function closeDatabase() {
    await pool.end();
}