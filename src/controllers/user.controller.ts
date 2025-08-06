/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { createUserSchema, getZodError, updateUserSchema, usersQueryValidator } from "../validator";
import createHttpError, { HttpError } from "http-errors";
import { Logger } from "winston";

export class UserController {
    private userService: UserService
    private logger: Logger
    constructor(userService: UserService, logger: Logger) {
        this.userService = userService
        this.logger = logger;
    }
    async create(req: Request, res: Response, next: NextFunction) {
        const validateUser = await createUserSchema.safeParseAsync(req.body)
        if (!validateUser.success) {
            return res.status(400).json({
                success: false,
                message: getZodError(validateUser)
            })
        }
        try {
            const user = await this.userService.create({
                email: validateUser?.data?.email!,
                firstName: validateUser?.data?.firstName!,
                lastName: validateUser?.data?.lastName!,
                password: validateUser?.data?.password!,
                role: validateUser?.data?.role,
                tanentId: String(validateUser?.data?.tanentId!)
            })
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    id: user.id
                }
            })

        } catch (error: HttpError | any) {
            const err = createHttpError((error?.status || error.statusCode) || 500, error?.message);
            return next(err);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = await usersQueryValidator.safeParseAsync(req.query);
        if (!validatedQuery.success) {
            const error = createHttpError(400, getZodError(validatedQuery));
            return next(error);
        }
        try {
            const { users, count } = await this.userService.getAll(
                {
                    currentPage: validatedQuery?.data?.currentPage!,
                    perPage: validatedQuery?.data?.perPage!,
                    q: validatedQuery?.data?.q!,
                    role: validatedQuery?.data?.role as "customer" | "manager" | "admin",
                }
            );

            this.logger.info("All users have been fetched");
            res.json({
                currentPage: validatedQuery.data?.currentPage as number,
                perPage: validatedQuery.data?.perPage as number,
                total: count,
                data: users,
            });
        } catch (err: HttpError | any) {
            const error = createHttpError(err.statusCode || 500, err.message);
            next(error);
        }
    }
    async getById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        try {
            const user = await this.userService.findById(id);
            if (!user) {
                const error = createHttpError(404, "User not found");
                next(error);
                return;
            }
            return res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data: {
                    id: user?.id,
                    email: user?.email,
                    role: user?.role,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                },
            })
        } catch (err: HttpError | any) {
            const error = createHttpError(err.statusCode || 500, err.message);
            return next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction) {
        const validator = await updateUserSchema.safeParseAsync(req.body);
        if (!validator.success) {
            return res.status(400).json({
                success: false,
                message: getZodError(validator)
            });
        }

        try {
            const updatedUser = await this.userService.update({
                id: Number(req.params.id),
                data: validator.data
            });

            return res.status(200).json({
                success: true,
                data: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName
                }
            });
        } catch (err: HttpError | any) {
            const error = createHttpError(err.statusCode || 500, err.message);
            return next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
    try {
            await this.userService.delete(Number(req.params.id));
            return res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        } catch (err: HttpError | any) {
            const error = createHttpError(err.statusCode || 500, err.message);
            return next(error);
        }
    }
}