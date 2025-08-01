import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { UserService } from "../../src/services/user.service";
import createJWKSMock from "mock-jwks";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5000");
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        jwks.start();
        // Database truncate

        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(async () => {
        jwks.stop();
    });
    afterAll(async () => {
        // Close connection
        await connection.destroy();
    });

    describe("happy path", () => {
        let createdUser: User;
        beforeEach(async () => {
            const userService = new UserService(connection.getRepository(User));
            createdUser = await userService.create({
                firstName: "Test",
                lastName: "User",
                email: "testuser@example.com",
                password: "strong-password-123",
            });
        });
        it("should return 200 status code", async () => {
            // AAA
            // Arrange
            const accessToken = jwks.token({
                sub: String(createdUser.id),
                role: createdUser.role,
                email: createdUser.email,
            });
            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });
        it("should return user details in valid JSON response", async () => {
            // AAA
            // Arrange
            const accessToken = jwks.token({
                sub: String(createdUser.id),
                role: createdUser.role,
                email: createdUser.email,
            });
            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            // Assert
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("firstName");
            expect(response.body.data).toHaveProperty("lastName");
            expect(response.body.data).toHaveProperty("email");
            expect(response.body.data).toHaveProperty("role");
        });
    });
});
