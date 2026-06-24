import bcrypt from "bcryptjs";
import * as repository from "../repository/authRepository";
import { UserResponse } from "../types/userInterfaces";
import { UserRegistryInput } from "../schemas/auth.schema";
import { AppError } from "../errors/appError";

export async function registerUser(data: UserRegistryInput): Promise<UserResponse>{
    const userExists = await repository.findByEmail(data.email);
    if (userExists){
        throw new AppError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await repository.create(data.email, passwordHash);
    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at
    };
}