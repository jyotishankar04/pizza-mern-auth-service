import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { UserService } from "../../src/services/user.service";
import { isValidJWT } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /tanents", () => {
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
        it("should return 201 status code", async () => {
            // AAA
            const tanentData = {
                name: "Test Tanent",
                address: " 123 Main St, Anytown, USA",
            }
            const response =await request(app).post("/tanents").send({
                name: tanentData.name,
                address: tanentData.address,
            })

            // Assert
            expect(response.statusCode).toBe(201);
            
        });
    });
});
