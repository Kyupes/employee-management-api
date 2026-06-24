import * as services from "../services/authServices";
import { Request, Response } from "express";
import { UserRegistryInput } from "../schemas/auth.schema";

export async function createUser(req: Request, res: Response){
    const validatedBody = req.validated?.body as UserRegistryInput;
    const user = await services.registerUser(validatedBody);
    return res.status(201).json(user);
}