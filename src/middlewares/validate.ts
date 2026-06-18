import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '../errors/appError';
type RequestPart = 'body' | 'params' | 'query';

export const validate = (schema: ZodType, part: RequestPart = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = schema.parse(req[part]);
            req.validated = { [part]: data };
            next();
        } catch (error) {
            if (error instanceof ZodError){
                const result = error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }));
                next(new AppError("Validation failed", 400, result));
                return;
            }
            next(error);
        }
    }
}
