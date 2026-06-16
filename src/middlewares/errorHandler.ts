import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';

export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal server Error";
    let errors: any[] | undefined = [];
    if ( err instanceof AppError ){
        statusCode = err.statusCode;
        message = err.message;
        if (err.errors){
            errors = err.errors;
        }
    }
    res.status(statusCode).json({ 
        status: 'Error',
        statusCode,
        message,
        errors,
     });
};