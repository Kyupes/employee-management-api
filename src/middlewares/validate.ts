import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '../errors/appError';

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError){
                const result = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
                next(new AppError("Validation failed", 400, result));
                return;
            }
            next(error);
        }
    }
}