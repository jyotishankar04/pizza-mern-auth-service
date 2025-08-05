import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";
export const canAccess = (roles:any) => {
    return (req:Request, res:Response, next:NextFunction)=>{
        const _req = req as AuthRequest
        if (roles.includes(_req.auth.role)) {
            next();
        } else {
            const error = createHttpError(403, "Access Forbidden! You don't have permission to access this resource");
            next(error);
        }

    }
};