import request from "supertest";
import app from "../../src/app";
describe("POST /auth/register", () => {
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
            }
            // Act
            const response = await request(app).post("/auth/register").send(payload);
            // Assert
            expect(response.statusCode).toBe(201);
        })
        it("should return valid JSON response", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            }
            // Act
            const response = await request(app).post("/auth/register").send(payload);
            // Assert
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        })
        it("should persist the user in DB", async () => {
            // AAA
            // Arrange
            const payload = {
                firstName: "Subham",
                lastName: "Gupta",
                email: "subhamgupta@me.com",
                password: "password",
            }
            // Act
            const response = await request(app).post("/auth/register").send(payload);
            // Assert
            
        })

    })



    // Given missing fields
    describe.skip("sad path", () => {})
})