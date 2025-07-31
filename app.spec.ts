import { calculateDiscount } from "./src/utils";
import request from "supertest";
import app from "./src/app";
describe.skip("App", () => {
    it("should return correct discount amout", () => {
        const result = calculateDiscount(100, 10);
        expect(result).toBe(10);
    });

    it("should return 200 status code", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});
