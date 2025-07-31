import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entity/User"
import { _config } from "."

export const AppDataSource = new DataSource({
    type: "postgres",
    host: _config.DB_HOST,
    port: Number(_config.DB_PORT),
    username: _config.DB_USERNAME,
    password: _config.DB_PASSWORD,
    database: _config.DB_NAME,
    synchronize: _config.NODE_ENV === "test" || _config.NODE_ENV === "dev",
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
