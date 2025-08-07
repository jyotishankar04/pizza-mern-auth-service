import "reflect-metadata";
import { DataSource } from "typeorm";
import { _config } from "./";

function validateEnv() {
    const required = [
        { key: "DB_HOST", value: _config.DB_HOST },
        { key: "DB_PORT", value: _config.DB_PORT },
        { key: "DB_USERNAME", value: _config.DB_USERNAME },
        { key: "DB_NAME", value: _config.DB_NAME },
    ];

    const missing = required.filter(({ value }) => !value);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing
                .map(({ key }) => key)
                .join(", ")}`,
        );
    }
}

validateEnv();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: _config.DB_HOST,
    port: parseInt(_config.DB_PORT!, 10),
    username: _config.DB_USERNAME,
    password: _config.DB_PASSWORD || "",
    database: _config.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [__dirname + "/../entity/*.{js,ts}"],
    migrations: [__dirname + "/../migration/*.{js,ts}"],
    subscribers: [],
    ssl: true,
});

// Connection helper for testing
export async function initializeDB() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");
    } catch (err) {
        console.error("Error during Data Source initialization:", err);
        throw err;
    }
}
