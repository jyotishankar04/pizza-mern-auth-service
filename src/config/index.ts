import { config } from "dotenv";

config()

const { NODE_ENV,PORT } = process.env;

export const _config = {
    NODE_ENV,
    PORT
} as const