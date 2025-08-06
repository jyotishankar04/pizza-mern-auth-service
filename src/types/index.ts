import { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    tanentId?: string | number;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        email: string;
        role: string;
        sub: string;
        id?: string;
    };
}

export interface IRefreshTokenPayload {
    id: number;
}

// Tanents

export interface ITanentData {
    name: string;
    address: string;
}

export interface TenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}

export enum TRoles {
    "customer",
    "manager",
    "admin",
}

// Users
export interface IUserQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
    role: "customer" | "manager" | "admin";
}
