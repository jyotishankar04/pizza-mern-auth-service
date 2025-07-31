import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService: UserService = new UserService(userRepository);
const authController: AuthController = new AuthController(userService, logger);

router.post("/register", authController.register.bind(authController));

export default router;
