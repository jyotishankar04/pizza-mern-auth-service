import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
// reflect-metadata typeorm needs
import "reflect-metadata";

const app = express();
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res, next) => {
    return next(createHttpError(400, "Success"));
});

app.use("/auth", authRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: [
            {
                type: err.name,
                message: err.message,
                path: "",
                location: "",
            },
        ],
        success: false,
        message: err.message,
    });
});

export default app;
