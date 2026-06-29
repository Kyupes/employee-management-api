import { Request as ExpressRequest } from 'express';
import { UserRole } from '../types/userInterfaces';

declare global {
    namespace Express {
        interface Request {
            validated?: {
                body?: unknown;
                params?: unknown;
                query?: unknown;
            };
            user?: {
                userId: number;
                email: string;
                role: UserRole;
            };
        }
    }
}

export {};