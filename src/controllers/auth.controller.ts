/* eslint-disable no-unused-vars */

import { NextFunction, Response, Request } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";
import { Logger } from "winston";
import { getZodError, loginSchema, registerUserSchema } from "../validator";
import createHttpError from "http-errors";
import { _config } from "../config";
import { TokenService } from "../services/token.service";
import { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";

export class AuthController {
    private userService: UserService;
    private tokenService: TokenService;
    private logger: Logger;
    constructor(
        userService: UserService,
        tokenService: TokenService,
        logger: Logger,
    ) {
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
            const newRefreshToken = await this.tokenService.persistRefreshToken(
                {
                    user,
                },
            );
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
    async login(req: Request, res: Response, next: NextFunction) {
        const validator = loginSchema.safeParse(req.body);
        if (!validator.success) {
            const error = createHttpError(400, getZodError(validator));
            next(error);
            return;
        }

        this.logger.debug(
            `Logging in user with data: ${{
                email: validator.data.email,
                password: "***",
            }}`,
        );
        try {
            const user = await this.userService.findByEmail(
                validator.data.email,
            );
            if (!user) {
                const error = createHttpError(401, "Invalid credentials");
                next(error);
                return;
            }

            const isPasswordValid = await this.userService.comparePassword(
                validator.data.password,
                user.password,
            );
            if (!isPasswordValid) {
                const error = createHttpError(401, "Invalid credentials");
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                email: user.email,
                role: user.role,
            };
            const accessToken = await this.tokenService.generateAccessToken({
                payload,
            });
            // persist refresh token
            const newRefreshToken = await this.tokenService.persistRefreshToken(
                {
                    user,
                },
            );
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

            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        } catch (error) {
            next(error);
            return;
        }
    }
    async self(req: AuthRequest, res: Response, next: NextFunction) {
        // token data in req.user
        const user = await this.userService.findById(Number(req.auth.sub));
        if (!user) {
            const error = createHttpError(401, "Invalid user");
            next(error);
            return;
        }
        return res.json({
            success: true,
            message: "User retrieved successfully",
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                email: req.auth.email,
                role: req.auth.role,
            };

            const user = await this.userService.findById(Number(payload.sub));
            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token not found",
                );
                next(error);
                return;
            }

            const accessToken = await this.tokenService.generateAccessToken({
                payload,
            });
            const newRefreshToken = await this.tokenService.persistRefreshToken(
                {
                    user: user as User,
                },
            );
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
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
            return res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: {
                    id: user.id,
                },
            });
        } catch (error) {
            next(error);
            return;
        }
    }
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info(`Deleting refresh token with id: ${req.auth.id}`);
            this.logger.info(
                `User logged out successfully with id: ${req.auth.id}`,
            );

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.status(200).json({
                success: true,
                message: "User logged out successfully",
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
