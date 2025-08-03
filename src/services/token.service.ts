/* eslint-disable no-unused-vars */
import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { _config } from "../config";
import createHttpError from "http-errors";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
    private refreshTokenRepository: Repository<RefreshToken>;
    constructor(refreshTokenRepository: Repository<RefreshToken>) {
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async generateAccessToken({ payload }: { payload: JwtPayload }) {
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
    async generateRefreshToken({
        refreshTokenId,
        payload,
    }: {
        refreshTokenId: string;
        payload: JwtPayload;
    }) {
        return sign(
            {
                ...payload,
                id: refreshTokenId,
            },
            _config.REFRESH_TOKEN_SECRET!,
            {
                expiresIn: "7d",
                algorithm: "HS256",
                issuer: "auth-service",
                jwtid: refreshTokenId,
            },
        );
    }

    async persistRefreshToken({ user }: { user: User }) {
        const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newRefreshToken = await this.refreshTokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + MS_IN_A_YEAR),
        });
        return newRefreshToken;
    }
    async deleteRefreshToken(id: number) {
        try {
            await this.refreshTokenRepository.delete({
                id,
            });
        } catch (error) {
            const err = createHttpError(500, "Failed to delete refresh token");
            throw err;
        }
    }
}
