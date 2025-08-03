import { expressjwt } from "express-jwt";
import { Request } from "express";
import { _config } from "../config";

export const parseRefreshToken = expressjwt({
    secret: _config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: (req: Request) => {
        if (req.cookies.refreshToken) {
            return req.cookies.refreshToken;
        }
        return null;
    },
});
