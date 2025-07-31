import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import logger from "./config/logger";

const app = express();

app.get("/", (req, res, next) => {
    res.send("Hello World!");
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: [{
            type: err.name,
            message: err.message,
            path: "",
            location: ""
        },
        ],
        success: false,
        message: err.message
    })
});


export default app;
