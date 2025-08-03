import { expressjwt } from "express-jwt";
import { Request } from "express";
import { _config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";
import { IRefreshTokenPayload } from "../types";

export const validateRefreshToken = expressjwt({
    secret: _config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken: (req: Request) => {
        if (req.cookies.refreshToken) {
            return req.cookies.refreshToken;
        }
        return null;
    },
    async isRevoked(req: Request, token) {
        {
            try {
                const refreshTokenRepository =
                    AppDataSource.getRepository(RefreshToken);

                const refreshTokens = await refreshTokenRepository.findOne({
                    where: {
                        id: Number((token?.payload as IRefreshTokenPayload).id),
                        user: {
                            id: Number(token?.payload.sub),
                        },
                    },
                });
                return refreshTokens === null;
            } catch (err) {
                logger.error(
                    "Error validating refresh token: " +
                        err +
                        " " +
                        (token?.payload as IRefreshTokenPayload).id,
                );
                return true;
            }
        }
    },
});
