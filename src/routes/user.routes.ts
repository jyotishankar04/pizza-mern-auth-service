import express, { NextFunction, Request, Response } from "express";

import { authenticate } from "../middlewares/authenticate.middleware";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../constants";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import { Tanent } from "../entity/Tanent";
import logger from "../config/logger";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const tanentRepository = AppDataSource.getRepository(Tanent);
const userService = new UserService(userRepository,tanentRepository);
const userController = new UserController(userService,logger);


router.post("/", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) => userController.create(req, res, next));

router.get("/", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) => userController.getAll(req, res, next));

router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) => userController.getById(req, res, next));

router.patch("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) => userController.update(req, res, next));

router.delete("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) => userController.delete(req, res, next));

export default router;
