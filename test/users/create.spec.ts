import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { UserService } from "../../src/services/user.service";
import { isValidJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { Tanent } from "../../src/entity/Tanent";

describe("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken = "";

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock("http://localhost:5000");
    });

    beforeEach(async () => {
        jwks.start();
        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
        // Wipes the database clean before each test run
        await connection.synchronize(true);
    });
    afterEach(async () => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("happy path", () => {
        // Test 1: Verify status code and success message
        it("should create and persist the user in the database", async () => {
            // First create a tenant
            const tenant = await connection.getRepository(Tanent).save({
                name: "Test Tenant",
                address: "123 Test St"
            });

            const userData = {
                firstName: "Test",
                lastName: "User",
                email: "testuser@example.com",
                password: "strong-password-123",
                tanentId: tenant.id, // Use the ID of the created tenant
                role: Roles.MANAGER,
            }

            // Act: Perform the login request
            const response = await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBeDefined();

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({
                relations: ["tanent"]
            });

            expect(users.length).toBe(1);
            expect(users[0].role).toBe(userData.role);
            expect(users[0].email).toBe(userData.email);
            expect(users[0].tanent.id).toBe(tenant.id); // Verify tenant association
            expect(users[0].tanent.name).toBe(tenant.name);
        });
        it("should return 403 if user is not admin",async () => {
            const userToken  = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            })
            const userData = {
                firstName: "Test",
                lastName: "User",
                email: "testuser@example.com",
                password: "strong-password-123",
                role: Roles.MANAGER,
            }
            const response = await request(app).post("/users").set("Cookie", [`accessToken=${userToken}`]).send(userData);
            expect(response.statusCode).toBe(403);
        });


    });
});
