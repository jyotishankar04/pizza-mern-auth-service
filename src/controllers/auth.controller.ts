/* eslint-disable no-unused-vars */
import fs from "fs";
import path from "path";

import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";
import { Logger } from "winston";
import { getZodError, registerUserSchema } from "../validator";
import createHttpError from "http-errors";
import { getTrimmedBody } from "../utils";
import { JwtPayload, sign } from "jsonwebtoken";
import { _config } from "../config";

export class AuthController {
    private userService: UserService;
    private logger: Logger;
    constructor(userService: UserService, logger: Logger) {
        this.userService = userService;
        this.logger = logger;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const trimmedBody = getTrimmedBody(req);
        const validator = registerUserSchema.safeParse(trimmedBody);
        if (!validator.success) {
            const error = createHttpError(400, getZodError(validator));
            next(error);
            return;
        }
        this.logger.debug(
            `Registering user with data: ${{
                firstName: validator.data.firstName,
                lastName: validator.data.lastName,
                email: validator.data.email,
                password: "***",
            }}`,
        );
        try {
            const user = await this.userService.create({
                firstName: validator.data.firstName,
                lastName: validator.data.lastName,
                email: validator.data.email,
                password: validator.data.password,
            });
            this.logger.info(
                `User registered successfully with id: ${user.id}`,
            );
            let privateKey;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (error) {
                const err = createHttpError(500, "Failed to read private key");
                next(err);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
                role: user.role,
            };
            const accessToken = sign(payload, privateKey, {
                expiresIn: "1h",
                algorithm: "RS256",
                issuer: "auth-service",
            });
            const refreshToken = sign(payload, _config.REFRESH_TOKEN_SECRET!, {
                expiresIn: "1y",
                algorithm: "HS256",
                issuer: "auth-service",
            });
            res.cookie("accessToken", accessToken, {
                sameSite: "strict",
                domain: "localhost",
                maxAge: 1000 * 60 * 60,
                httpOnly: true, //Very important
            });
            res.cookie("refreshToken", refreshToken, {
                sameSite: "strict",
                domain: "localhost",
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true, //Very important
            });
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
