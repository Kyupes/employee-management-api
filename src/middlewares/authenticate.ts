import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface JwtPayload {
    userId: number;
    email: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const regex = /^Bearer \b/;
        if (!authHeader || !regex.test(authHeader)){
            throw new AppError("Authentication required", 401);
        }
        const token = authHeader.split(' ')[1];
        if (!token){
            throw new AppError("Invalid token", 401);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
        req.user = decoded;
        next();
    } catch (err){        
        if (err instanceof TokenExpiredError){
            next(new AppError("Token expired", 401));
            return
        }
        if (err instanceof JsonWebTokenError){
            next(new AppError("Invalid token: " + err.message, 401));
            return;     
        }
        next(err);
    }
}