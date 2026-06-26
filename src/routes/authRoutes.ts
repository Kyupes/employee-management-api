import express from "express";
import * as controllers from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { UserRegistrySchema, UserLoginSchema } from "../schemas/auth.schema";

const router = express.Router();

router.post("/auth/register", validate(UserRegistrySchema, 'body'), controllers.createUser);
router.post("/auth/login", validate(UserLoginSchema, 'body'), controllers.login);

export default router;