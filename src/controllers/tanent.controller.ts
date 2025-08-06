import { NextFunction, Request, Response } from "express";
import { TanentService } from "../services/tanent.service";
import { Logger } from "winston";
import { createTanentSchema, getZodError, tanentQueryValidator, updateTanentSchema } from "../validator";
import createHttpError from "http-errors";

export class TanentController {
    private tanentService: TanentService;
    private logger: Logger;
    constructor(tanentService: TanentService, logger: Logger) {
        this.tanentService = tanentService;
        this.logger = logger;
    }
    async create(req: Request, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        const validator = await createTanentSchema.safeParseAsync({
            name,
            address,
        });
        if(!validator.success) {
            const error = createHttpError(400, getZodError(validator));
            return next(error);
        }
        this.logger.info(
            `Creating tanent with name: ${name} and address: ${address}`,
        );
        try {
            const tanent = await this.tanentService.create({
                name: validator?.data?.name!,
                address: validator?.data?.address!,
            });
            return res.status(201).json({
                success: true,
                message: "Tanent created successfully",
                data: {
                    id: tanent.id,
                },
            });
        } catch (error) {
            this.logger.error(`Error c reating tanent: ${error}`);
            return next(error);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        this.logger.info(`Getting all tanents`);
        const validator = await tanentQueryValidator.safeParseAsync(req.query);
        if(!validator.success) {
            const error = createHttpError(400, getZodError(validator));
            return next(error);
        }
        try {
            const tanents = await this.tanentService.getAll({
                currentPage: validator?.data?.currentPage!,
                perPage: validator?.data?.perPage!,
                q: validator?.data?.q!,
            });
            return res.status(200).json({
                success: true,
                message: "Tanents retrieved successfully",
                data: {
                    tanents:tanents.data,
                    total: tanents.count,
                },
            });
        } catch (error) {
            this.logger.error(`Error getting tanents: ${error}`);
            return next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            const error = createHttpError(400, "Tanent id is required");
            return next(error);
        }
        this.logger.info(`Getting tanent with id: ${req.params.id}`);
        try {
            const tanent = await this.tanentService.findById(Number(req.params.id));
            if (!tanent) {
                const error = createHttpError(404, "Tanent not exists");
                return next(error);
            }
            return res.status(200).json({
                success: true,
                message: "Tanent retrieved successfully",
                data: {
                    id: tanent.id,
                    name: tanent.name,
                    address: tanent.address,
                },
            });
        } catch (error) {
            this.logger.error(`Error getting tanent: ${error}`);
            return next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            const error = createHttpError(400, "Tanent id is required");
            return next(error);
        }
        this.logger.info(`Updating tanent with id: ${req.params.id}`);
        const validator = await updateTanentSchema.safeParseAsync(req.body);
        try {
            const tanent = await this.tanentService.update(Number(req.params.id),{
                name: validator?.data?.name!,
                address: validator?.data?.address!,
            });
            return res.status(200).json({
                success: true,
                message: "Tanent updated successfully",
                data: {
                    id: tanent.id,
                    name: tanent.name,
                    address: tanent.address,
                },
            });
        } catch (error) {
            this.logger.error(`Error updating tanent: ${error}`);
            return next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            const error = createHttpError(400, "Tanent id is required");
            return next(error);
        }
        this.logger.info(`Deleting tanent with id: ${req.params.id}`);
        try {
            await this.tanentService.delete(Number(req.params.id));
            return res.status(200).json({
                success: true,
                message: "Tanent deleted successfully",
            });
        } catch (error) {
            this.logger.error(`Error deleting tanent: ${error}`);
            return next(error);
        }
    }
    
}
