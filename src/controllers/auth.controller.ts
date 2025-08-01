/* eslint-disable no-unused-vars */

import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";
import { Logger } from "winston";
import { getZodError, registerUserSchema } from "../validator";
import createHttpError from "http-errors";
import { _config } from "../config";
import { TokenService } from "../services/token.service";
import { JwtPayload } from "jsonwebtoken";

export class AuthController {
    private userService: UserService;
    private tokenService: TokenService;
    private logger: Logger;
    constructor(userService: UserService, tokenService: TokenService, logger: Logger) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.logger = logger;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const validator = registerUserSchema.safeParse(req.body);
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

            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
                role: user.role,
            };
            const accessToken = await this.tokenService.generateAccessToken({
                payload,
            });
            // persist refresh token
            const newRefreshToken = await this.tokenService.persistRefreshToken({
                user
            })
            const refreshToken = await this.tokenService.generateRefreshToken({
                refreshTokenId: String(newRefreshToken.id),
                payload,
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
