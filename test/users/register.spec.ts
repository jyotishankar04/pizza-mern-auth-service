import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";
describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        // Database truncate
        truncateTables(connection);
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
            expect(users[0].password).toBe(payload.password);
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
    });

    // Given missing fields
    describe.skip("sad path", () => {});
});
