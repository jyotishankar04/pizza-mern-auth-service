import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";


export class UserService {
    private userRepository: Repository<User>
    constructor(userRepository: Repository<User>) {
        this.userRepository = userRepository
    }

    async create({ firstName, lastName, email, password }:UserData) {
        const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = password;
        await this.userRepository.save(user);
        return user;
    }
}