import { pool } from "../config/db";
import { User, UserRole } from "../types/userInterfaces";

export async function findByEmail(email: string): Promise<User | null>{
    const query = "SELECT * FROM users WHERE email = $1;";
    const result = await pool.query(query, [email]);
    return result.rows[0];
}

export async function create(email: string, passwordHash: string, role: UserRole): Promise <User>{
    const query = "INSERT INTO users(email, password_hash, role) VALUES ($1, $2, $3) RETURNING *;";
    const result = await pool.query(query, [email, passwordHash, role]);
    return result.rows[0];
}