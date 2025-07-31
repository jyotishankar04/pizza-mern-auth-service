import winston from "winston";

const logger  = winston.createLogger({
    level: "info",
    defaultMeta:{
        serviceName: "auth-service"
    },
    transports:[
        new winston.transports.File({filename: "error.log", dirname: "logs" ,level: "error", format:winston.format.combine(winston.format.timestamp(), winston.format.json())}),
        new winston.transports.File({filename: "combined.log",dirname: "logs", format:winston.format.combine(winston.format.timestamp(), winston.format.json())}),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp(),
                winston.format.json()
            ),
            silent: process.env.NODE_ENV === "test",
        }),
    ]
})

export default logger