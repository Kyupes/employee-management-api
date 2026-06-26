import * as services from "../services/authServices";
import { Request, Response } from "express";
import { UserLoginInput, UserRegistryInput } from "../schemas/auth.schema";

export async function createUser(req: Request, res: Response){
    const validatedBody = req.validated?.body as UserRegistryInput;
    const user = await services.registerUser(validatedBody);
    return res.status(201).json(user);
}

export async function login(req: Request, res: Response){
    const validatedBody = req.validated?.body as UserLoginInput;
    const data = await services.loginUser(validatedBody);
    return res.status(200).json(data);
}