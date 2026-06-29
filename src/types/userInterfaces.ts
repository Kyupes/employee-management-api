export type UserRole = 'admin' | 'user';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
    role: UserRole;
}

export interface UserResponse {
    id: number;
    email: string;
    created_at: string;
}