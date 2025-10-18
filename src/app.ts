import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRoutes from "./routes/auth.routes";
import tanentRoutes from "./routes/tanent.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import cors from "cors";

// reflect-metadata typeorm needs
import "reflect-metadata";
import path from "path";
import fs from "fs";
import { _config } from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [_config.FRONTEND_ADMIN_URL!],
        credentials: true,
    }),
);
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
app.use(globalErrorHandler);

export default app;
