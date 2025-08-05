import express, { NextFunction, Request, Response } from "express";
import { TanentController } from "../controllers/tanent.controller";
import { TanentService } from "../services/tanent.service";
import { Tanent } from "../entity/Tanent";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

const tanentRepository = AppDataSource.getRepository(Tanent);
const tanentService = new TanentService(tanentRepository, logger);
const tanentController = new TanentController(tanentService, logger);
router.post("/", authenticate, (req: Request, res: Response, next: NextFunction) => tanentController.create(req, res, next));




export default router;