import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { TokenService } from "../services/token.service";
import { RefreshToken } from "../entity/RefreshToken";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const userService: UserService = new UserService(userRepository);
const authController: AuthController = new AuthController(
    userService,
    tokenService,
    logger,
);

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

export default router;
