/* eslint-disable no-unused-vars */
import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { _config } from "../config";
import createHttpError from "http-errors";

export class TokenService {
    async generateAccessToken({ payload }:{ payload: JwtPayload}) {
        let privateKey;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (error) {
            const err = createHttpError(500, "Failed to read private key");
            throw err;
        }
        return sign(payload, privateKey, {
            expiresIn: "1h",
            algorithm: "RS256",
            issuer: "auth-service",
        });
    }
    async generateRefreshToken({ refreshTokenId ,payload}:{ refreshTokenId: string, payload: JwtPayload} ) {

        return sign(payload, _config.REFRESH_TOKEN_SECRET!, {
            expiresIn: "7d",
            algorithm: "HS256",
            issuer: "auth-service",
            jwtid: refreshTokenId,
        });
    }
}