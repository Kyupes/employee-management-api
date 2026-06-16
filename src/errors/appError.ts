export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public errors?: any[];

    constructor(message: string, statusCode: number, errors?: any[]) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        if (errors){
            this.errors = errors;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}