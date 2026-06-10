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
    if ( err instanceof AppError ){
        statusCode = err.statusCode;
        message = err.message;
    }
    res.status(statusCode).json({ 
        status: 'Error',
        statusCode,
        message,
     });
};