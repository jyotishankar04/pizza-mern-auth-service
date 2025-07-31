import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";
import { Logger } from "winston";

export class AuthController {
    private    userService: UserService;
    private logger:Logger;
    constructor(userService: UserService, logger:Logger) {
        this.userService = userService;
        this.logger=logger
    }
    async register(req: RegisterUserRequest, res: Response,next:NextFunction) {
        const { email, firstName, lastName, password } = req.body;
        this.logger.debug(`Registering user with data: ${
                {
                    email,
                    firstName,
                    lastName,
                    password:"******"
                }
            }`);
        try {
            const user = await this.userService.create({
                email,
                firstName,
                lastName,
                password,
            });
            this.logger.info(`User registered successfully with id: ${user.id}`);
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: { id: user.id },
            });

        } catch (error) {
            next(error);
            return;            
        }
    }
}
