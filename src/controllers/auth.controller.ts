import { Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/user.service";

export class AuthController {
    userService: UserService
    constructor(userService: UserService) {
        this.userService = userService
    }
    async register(req: RegisterUserRequest, res: Response) {

        await this.userService.create({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    }
}
