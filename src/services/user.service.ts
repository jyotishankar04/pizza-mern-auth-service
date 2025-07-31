/* eslint-disable no-unused-vars */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    private userRepository: Repository<User>;
    constructor(userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }
    private async hashPassword(password: string) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }
    async create({ firstName, lastName, email, password }: UserData) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const err = createHttpError(400, "Invalid email");
            throw err;
        }
        // Check if email already exist
        const existingUser = await this.userRepository.findOne({
            where: {
                email: email.toLocaleLowerCase(),
            },
        })
        if (existingUser) {
            const err = createHttpError(400, "Email already exist");
            throw err;
        }
        const hashedPassword = await this.hashPassword(password);
        const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email.toLocaleLowerCase();
        user.password = hashedPassword;
        user.role = Roles.CUSTOMER;
        try {
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            const err = createHttpError(500, "Failed to store data in DB");
            throw err;
        }
    }
}
