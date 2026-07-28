import express from "express";
import * as controllers from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { userRegistrySchema, userLoginSchema } from "../schemas/auth.schema";

const router = express.Router();

router.post("/auth/register", validate(userRegistrySchema, 'body'), controllers.createUser);
router.post("/auth/login", validate(userLoginSchema, 'body'), controllers.login);

export default router;