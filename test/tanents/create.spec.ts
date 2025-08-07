import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { UserService } from "../../src/services/user.service";
import { isValidJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { Tanent } from "../../src/entity/Tanent";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tanents", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken = "";
    beforeAll(async () => {
        try {
            
            connection = await AppDataSource.initialize();
        } catch (error) {
            console.error("Error during Data Source initialization:", error);
            throw error;
        }
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
        it("should return 201 status code", async () => {
            // AAA
            const tanentData = {
                name: "Test Tanent",
                address: " 123 Main St, Anytown, USA",
            };
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });

            // Assert
            // AAA
            expect(response.statusCode).toBe(201);
        });
        it("should return 401 if user not authenticated", async () => {
            // Arrange
            const tanentData = {
                name: "Test Tanent",
                address: " 123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app).post("/tanents").send({
                name: tanentData.name,
                address: tanentData.address,
            });
            // Assert
            expect(response.statusCode).toBe(401);

            const tanentRepository = connection.getRepository(Tanent);
            const tanents = await tanentRepository.find();
            expect(tanents).toHaveLength(0);
        });
        it("should return 403 if user is not admin", async () => {
            // Arrange
            const tanentData = {
                    name: "Test Tanent",
                    address: " 123 Main St, Anytown, USA",
                },
                managerToken = jwks.token({
                    sub: "1",
                    role: Roles.MANAGER,
                });
            // Act
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });
            // Assert
            expect(response.statusCode).toBe(403);
            const tanentRepository = connection.getRepository(Tanent);
            const tanents = await tanentRepository.find();
            expect(tanents).toHaveLength(0);
        });
        it("should create a new tanent in the database", async () => {
            // AAA
            // Arrange
            const tanentData = {
                name: "Test Tanent",
                address: "0123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });
            // Assert
            const tanentRepository = connection.getRepository(Tanent);
            const tanents = await tanentRepository.find();
            expect(tanents).toHaveLength(1);
            expect(tanents[0].name).toBe(tanentData.name);
            expect(tanents[0].address).toBe(tanentData.address);
        });
        it("should return the created tanent's id in the response body", async () => {
            // AAA
            // Arrange
            const tanentData = {
                name: "Test Tanent",
                address: "0123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });
            // Assert
            expect(response.body.data.id).toBeDefined();
        });
    });
    describe("sad path", () => {
        it("should return 400 if tanent name is missing", async () => {
            // AAA
            // Arrange
            const tanentData = {
                name: "",
                address: "0123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });
            // Assert
            expect(response.statusCode).toBe(400);
        });
        it("should return 400 if tanent address is missing", async () => {
            // AAA
            // Arrange
            const tanentData = {
                name: "Test Tanent",
                address: "",
            };
            // Act
            const response = await request(app)
                .post("/tanents")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: tanentData.name,
                    address: tanentData.address,
                });
            // Assert
            expect(response.statusCode).toBe(400);
        });
    });
});
