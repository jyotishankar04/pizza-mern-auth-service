/* eslint-disable no-unused-vars */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";

export class UserService {
    private userRepository: Repository<User>;
    constructor(userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const user = new User();
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.password = password;
            await this.userRepository.save(user);

            return user;
        } catch (error) {
            const err = createHttpError(500, "Failed to store data in DB");
            throw err;
        }
    }
}
