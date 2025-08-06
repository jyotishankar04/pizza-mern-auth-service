import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import tanentRoutes from "./routes/tanent.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
// reflect-metadata typeorm needs
import "reflect-metadata";
import path from "path";
import fs from "fs";
const app = express();
app.use(express.json());
app.use(cookieParser());

// for jwks endpoint
app.get("/.well-known/jwks.json", (_, res: Response) => {
    const files = fs.readFileSync(
        path.join(__dirname, "../public", ".well-known", "jwks.json"),
    );
    res.json(JSON.parse(files.toString()));
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/tanents", tanentRoutes);
app.use("/users", userRoutes);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
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
