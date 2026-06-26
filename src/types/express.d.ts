import { Request as ExpressRequest } from 'express';

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
            };
        }
    }
}

export {};