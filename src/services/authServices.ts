import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import * as repository from "../repository/authRepository";
import { UserResponse } from "../types/userInterfaces";
import { UserLoginInput, UserRegistryInput } from "../schemas/auth.schema";
import { AppError } from "../errors/appError";

export async function registerUser(data: UserRegistryInput): Promise<UserResponse>{
    const userExists = await repository.findByEmail(data.email);
    if (userExists){
        throw new AppError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await repository.create(data.email, passwordHash, 'user');
    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at
    };
}

export async function loginUser(data: UserLoginInput): Promise<{ token: string; user: UserResponse}>{
    const user = await repository.findByEmail(data.email);
    if (!user){
        throw new AppError("Invalid credentials", 401);
    }
    const comparePassword = await bcrypt.compare(data.password, user.password_hash);
    if (!comparePassword){
        throw new AppError("Invalid credentials", 401);
    }
    const payload = { userId: user.id, email: user.email, role: user.role };
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions;
    const token = jwt.sign(payload, process.env.JWT_SECRET!, options);
    const responseUser: UserResponse = { id: user.id, email: user.email, created_at: user.created_at };
    const result = { token: token, user: responseUser };
    return result;
}