import { expressjwt } from "express-jwt";
import { _config } from "../config";
import { expressJwtSecret } from "jwks-rsa";
import { Request } from "express";


export const authenticate = expressjwt({
    secret: expressJwtSecret({ jwksUri: _config.JWKS_URI!, cache: true, rateLimit: true }),
    algorithms: ["RS256"],
    getToken: ((req: Request) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];
            if (token) {
                return token;
            }
            return null;
        }
        if (req.cookies.accessToken) {
            return req.cookies.accessToken;
        }
        return null;
    })
});