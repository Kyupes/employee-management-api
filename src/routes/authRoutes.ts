import express from "express";
import * as controllers from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { UserRegistrySchema } from "../schemas/auth.schema";

const router = express.Router();

router.post("/auth/register", validate(UserRegistrySchema, 'body'), controllers.createUser);

export default router;