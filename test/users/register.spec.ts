import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { isValidJWT, truncateTables } from "../utils";
import { User } from "../../src/entity/User";
import { RefreshToken } from "../../src/entity/RefreshToken";
describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        // Close connection
        await connection.destroy();
    });

    // Given all fields
    describe("happpy path", () => {
        it("should return 201 status code", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            expect(response.statusCode).toBe(201);
        });
        it("should return valid JSON response", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should persist the user in DB", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users.length).toBe(1);
            expect(users[0].firstName).toBe(payload.firstName);
            expect(users[0].lastName).toBe(payload.lastName);
            expect(users[0].email).toBe(payload.email);
            expect(users[0].password).not.toBe(payload.password);
        });
        it("should return registered user's id", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].id).toBe(response.body.data.id);
        });
        it("should assign user role", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe("customer");
        });
        it("should hash password", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("password");
            expect(users[0].password).not.toBe(payload.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[b|a]\$\d+\$/);
        });
        it("should store unique, lowercase and valid email", async () => {
            // AAA
            // Arrange
            const userRepository = connection.getRepository(User);
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamGupta@me.com".toLocaleLowerCase(),
                password: "password",
                role: "customer",
            };
            await userRepository.save(payload);
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users.length).toBe(1);
            expect(users[0].email).toBe(payload.email);
            expect(users[0].email).toBe(payload.email.toLocaleLowerCase());
        });
        it("should return the access token and refresh token", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
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
        it("should persist refresh token in DB", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const refreshTokenRepository =
                connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepository.find();
            // expect(refreshTokens.length).toBe(1);
            const tokens = await refreshTokenRepository
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: response.body.data.id,
                })
                .getMany();
        });
    });

    // Given missing fields
    describe("sad path", () => {
        it("should return 400 status code for email missing or missing fields", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                password: "password",
                email: "subhamgupta@me.com",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            // Assert
            expect(response.statusCode).toBe(400);
        });
    });

    // /format issues
    describe("format issues", () => {
        it("should trim the email", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "  subhamgupta@me.com  ",
                password: "password",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(payload);
            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].email).toBe(payload.email.trim());
        });
    });
});
