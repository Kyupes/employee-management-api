import bcrypt from "bcryptjs";
import { env } from '../config/env';

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = env.SALT_ROUNDS || 12;
    return await bcrypt.hash(password, saltRounds);
}