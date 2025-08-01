import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { _config } from ".";
import { RefreshToken } from "../entity/RefreshToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: _config.DB_HOST,
    port: Number(_config.DB_PORT),
    username: _config.DB_USERNAME,
    password: _config.DB_PASSWORD,
    database: _config.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [User,RefreshToken],
    migrations: [],
    subscribers: [],
});
