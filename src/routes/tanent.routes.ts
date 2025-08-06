import express, { NextFunction, Request, Response } from "express";
import { TanentController } from "../controllers/tanent.controller";
import { TanentService } from "../services/tanent.service";
import { Tanent } from "../entity/Tanent";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { authenticate } from "../middlewares/authenticate.middleware";
import { canAccess } from "../middlewares/canAccess.middleware";
import { Roles } from "../constants";

const router = express.Router();

const tanentRepository = AppDataSource.getRepository(Tanent);
const tanentService = new TanentService(tanentRepository, logger);
const tanentController = new TanentController(tanentService, logger);
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tanentController.create(req, res, next),
);
router.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tanentController.getAll(req, res, next),
);
router.get(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tanentController.getById(req, res, next),
);
router.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tanentController.update(req, res, next),
);
router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tanentController.delete(req, res, next),
);
export default router;
