import { pool } from '../../src/config/db';

export async function clearDatabase() {
    await pool.query('TRUNCATE TABLE employees, users RESTART IDENTITY CASCADE;');
}

export async function makeAdmin(email: string) {
    await pool.query("UPDATE users SET role = 'admin' WHERE email = $1;", [email]);
}