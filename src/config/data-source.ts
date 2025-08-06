import "reflect-metadata";
import { DataSource } from "typeorm";
import { _config } from "./";

// Add validation for environment variables
function validateEnv() {
    const required = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_NAME'];
    required.forEach(key => {
        if (!_config.DB_HOST || !_config.DB_PORT || !_config.DB_USERNAME || !_config.DB_NAME) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    });
}

validateEnv();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: _config.DB_HOST,
    port: parseInt(_config.DB_PORT!, 10),
    username: _config.DB_USERNAME,
    password: _config.DB_PASSWORD || '', // Handle empty password case
    database: _config.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [__dirname + "/../entity/*.{js,ts}"], // Adjusted path
    migrations: [__dirname + "/../migration/*.{js,ts}"],
    subscribers: [],
});