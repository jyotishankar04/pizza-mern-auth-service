import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const {
    NODE_ENV,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
} = process.env;
console.log(
    `Database URL: postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
);
export const _config = {
    NODE_ENV,
    PORT,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
} as const;
