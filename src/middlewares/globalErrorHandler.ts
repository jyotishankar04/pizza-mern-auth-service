import { HttpError } from "http-errors";
import logger from "../config/logger";
import { v4 as uuid } from "uuid";
import {NextFunction, Request , Response} from "express";

export const globalErrorHandler = ( err:HttpError, req:Request, res:Response, _next:NextFunction)=> {
    const errorId = uuid()
    const statusCode = err.statusCode || err.status || 500;
    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction ? "Internal Server Error" : err.message;
    logger.error(errorId, err.message, err.stack, req.path, req.method, req.ip);
    res.status(statusCode).json({
        success: false,
        errorId,
        errors:[
            {
                ref: errorId,
                type: err.name,
                message,
                path: req.path,
                method: req.method,
                location: "Server",
                stack: isProduction ? undefined : err.stack,
            }
        ]
    });
}