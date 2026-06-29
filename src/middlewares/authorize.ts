import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/appError";
import { UserRole } from "../types/userInterfaces";


export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => { // won't check req.user as it already passed authentication
        if (!req.user || !allowedRoles.includes(req.user.role)){
            next(new AppError("Insufficient permissions", 403));
            return;
        }
        next();
    }
}