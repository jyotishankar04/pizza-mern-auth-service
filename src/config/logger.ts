import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: "error.log",
            dirname: "logs",
            level: "error",
        }),
        new winston.transports.File({
            filename: "combined.log",
            dirname: "logs",
        }),
        new winston.transports.File({
            level: "debug",
            dirname: "logs",
            filename: "debug.log",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: process.env.NODE_ENV === "test",
        }),
    ],
});

export default logger;
