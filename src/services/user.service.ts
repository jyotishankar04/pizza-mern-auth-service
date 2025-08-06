/* eslint-disable @typescript-eslint/no-unused-vars */
import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { IUserQueryParams, UserData } from "../types";
import createHttpError, { HttpError } from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import { Tanent } from "../entity/Tanent";

export class UserService {
    private userRepository: Repository<User>;
    private tanentRepository: Repository<Tanent> | null = null;
    constructor(
        userRepository: Repository<User>,
        tanentRepository?: Repository<Tanent>,
    ) {
        this.userRepository = userRepository;
        if (tanentRepository) {
            this.tanentRepository = tanentRepository;
        }
    }
    private async hashPassword(password: string) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }
    async comparePassword(password: string, passwordHash: string) {
        return await this.validatePassword(password, passwordHash);
    }
    private async validatePassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tanentId,
    }: UserData) {
        // Check if email already exist
        let tanent: Tanent | null = null;
        const existingUser = await this.userRepository.findOne({
            where: {
                email: email.toLocaleLowerCase(),
            },
        });
        if (existingUser) {
            const err = createHttpError(400, "Email already exist");
            throw err;
        }

        if (tanentId && this.tanentRepository) {
            tanent = await this.tanentRepository.findOne({
                where: {
                    id: Number(tanentId),
                },
            });
            if (!tanent) {
                const err = createHttpError(400, "Tanent not found");
                throw err;
            }
        }
        const hashedPassword = await this.hashPassword(password);

        const user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email.toLocaleLowerCase();
        user.password = hashedPassword;
        user.role =
            role === Roles.ADMIN ||
            role === Roles.MANAGER ||
            role === Roles.CUSTOMER
                ? role
                : Roles.CUSTOMER;
        if (tanent && tanentId) {
            user.tanent = tanent;
        }
        try {
            await this.userRepository.save(user);
            return user;
        } catch (error: any) {
            const err = createHttpError(
                error.statusCode || 500,
                error.message || "Failed to create user",
            );
            throw err;
        }
    }
    async findByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: {
                email: email.toLocaleLowerCase(),
            },
        });
        return user;
    }
    async findById(id: number) {
        const user = await this.userRepository.findOne({
            where: {
                id: id,
            },
        });
        return user;
    }
    async getAll(query: IUserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        if (query.q) {
            const searchTerm = `%${query.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere("user.email ILike :q", { q: searchTerm });
                }),
            );
        }

        if (query.role) {
            queryBuilder.andWhere("user.role = :role", {
                role: query.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect("user.tanent", "tanent") // Changed from 'tenant' to 'tanent'
            .skip((query.currentPage - 1) * query.perPage)
            .take(query.perPage)
            .orderBy("user.id", "DESC")
            .getManyAndCount();

        return {
            users: result[0],
            count: result[1],
        };
    }
    async update({ id, data }: { id: number; data: Partial<UserData> }) {
        const user = await this.userRepository.findOne({
            where: {
                id,
            },
        });
        if (!user) {
            const err = createHttpError(400, "User not found");
            throw err;
        }
        let tanent: Tanent | null = null;

        user.email = data.email || user.email;
        user.firstName = data.firstName || user.firstName;
        user.lastName = data.lastName || user.lastName;
        user.role = data.role || user.role;
        if (data.tanentId && this.tanentRepository) {
            tanent = await this.tanentRepository.findOne({
                where: {
                    id: Number(data.tanentId),
                },
            });
            if (!tanent) {
                const err = createHttpError(400, "Tanent not found");
                throw err;
            }
            user.tanent = tanent;
        }

        try {
            await this.userRepository.save(user);
            return user;
        } catch (error: HttpError | any) {
            const err = createHttpError(
                500,
                error?.message || "Failed to store data in DB",
            );
            throw err;
        }
    }
    async delete(id: number) {
        const user = await this.userRepository.findOne({
            where: {
                id,
            },
        });
        if (!user) {
            const err = createHttpError(400, "User not found");
            throw err;
        }
        try {
            await this.userRepository.remove(user);
        } catch (error: any) {
            const err = createHttpError(
                error.statusCode || 500,
                error?.message || "Failed to delete user",
            );
            throw err;
        }
    }
}
