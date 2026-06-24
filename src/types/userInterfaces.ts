export interface User {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
}

export interface UserResponse {
    id: number;
    email: string;
    created_at: string;
}