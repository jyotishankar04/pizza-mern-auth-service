import { Request } from "express";
export const getTrimmedBody = (req:Request) => {
    // Object.fromEntries(
    //     Object.entries(body).map(([key, value]) => [
    //         key,
    //         typeof value === "string" && value ? value.trim() : value,
    //     ]),
    // );
    return Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [
            key,
            typeof value === "string" && value ? value.trim() : value,
        ]),
    );
};