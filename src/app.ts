import express, { Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";

// reflect-metadata typeorm needs
import "reflect-metadata";


const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/auth", authRoutes);



app.use((err: HttpError, req: Request, res: Response) => {
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
