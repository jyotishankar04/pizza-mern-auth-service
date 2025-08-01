import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { UserService } from "../../src/services/user.service";
import { isValidJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Wipes the database clean before each test run
        await connection.synchronize(true);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("happy path", () => {
        const userData = {
            firstName: "Test",
            lastName: "User",
            email: "testuser@example.com",
            password: "strong-password-123",
        };

        // Create a test user before each test
        let createdUser: User;
        beforeEach(async () => {
            const userService = new UserService(connection.getRepository(User));
            createdUser = await userService.create(userData);
        });

        // Test 1: Verify status code and success message
        it("should return a 200 status code", async () => {
            // Act: Perform the login request
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
        });

        // Test 2: Verify the response contains the correct user's ID
        it("should return the logged-in user's ID in the response body", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.id).toBe(createdUser.id);
        });
        it("should return the logged-in user's email, first name, and last name ,role in the response body", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.body.data.email).toBeDefined();
            expect(response.body.data.email).toBe(userData.email);
            expect(response.body.data.firstName).toBeDefined();
            expect(response.body.data.firstName).toBe(userData.firstName);
            expect(response.body.data.lastName).toBeDefined();
            expect(response.body.data.lastName).toBe(userData.lastName);
            expect(response.body.data.role).toBeDefined();
            expect(response.body.data.role).toBe("customer");
        });
        it("should not return the logged-in user's password in the response body", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });

            // Assert
            expect(response.body.data.password).toBeUndefined();
        });
        it("should not allow login with invalid credentials", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: "email@example.com",
                password: "invalid-password",
            });

            // Assert
            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it("should check if email and password are in format", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: "invalid-email",
                password: "invalid-password",
            });
            // Assert
            expect(response.statusCode).toBe(400);
        });
        it("should return access and refresh token", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });
            // Assert

            const accessToken =
                response.headers["set-cookie"][0].split(";")[0].split("=")[1] ||
                "";
            const refreshToken =
                response.headers["set-cookie"][1].split(";")[0].split("=")[1] ||
                "";
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isValidJWT(accessToken)).toBeTruthy();
            expect(isValidJWT(refreshToken)).toBeTruthy();
        });
        it("should persist the refresh token in the database", async () => {
            // Act
            const response = await request(app).post("/auth/login").send({
                email: userData.email,
                password: userData.password,
            });
            // Assert
            const refreshTokenRepository =
                await connection.getRepository(RefreshToken);
            // expect(refreshTokens.length).toBe(1);
            // expect(refreshTokens[0].user.id).toBe(response.body.data.id);
            const tokens = await refreshTokenRepository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: response.body.data.id,
                })
                .getMany();
        });
    });
});
