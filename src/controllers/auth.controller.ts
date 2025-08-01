/* eslint-disable no-unused-vars */

import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";
import { Logger } from "winston";
import { getZodError, registerUserSchema } from "../validator";
import createHttpError from "http-errors";
import { getTrimmedBody } from "../utils";
import { _config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { TokenService } from "../services/token.service";
import { JwtPayload } from "jsonwebtoken";

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

            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
                role: user.role,
            };
            const tokenService = new TokenService();
            const accessToken = await tokenService.generateAccessToken({
                payload,
            });
            // persist refresh token
            const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                user,
                expiresAt: new Date(Date.now() + MS_IN_A_YEAR),
            });
            const refreshToken = await tokenService.generateRefreshToken({
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
