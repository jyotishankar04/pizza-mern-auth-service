import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { RegisterUserRequest } from "../types";

export class AuthController {
    async register(req: RegisterUserRequest, res: Response) {
        const userRepository = AppDataSource.getRepository(User);
        const { firstName, lastName, email, password } = req.body;
        await userRepository.save({ firstName, lastName, email, password });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    }
}
