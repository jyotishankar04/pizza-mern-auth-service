import { NextFunction, Request, Response } from "express";
import { TanentService } from "../services/tanent.service";
import { Logger } from "winston";
import { createTanentSchema } from "../validator";

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
}
