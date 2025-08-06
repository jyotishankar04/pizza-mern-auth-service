import zod from "zod";

const getZodError = (validator: {
    error: {
        issues: {
            message: string;
        }[];
    };
}) => {
    return validator.error.issues[0].message;
};

const registerUserSchema = zod.object({
    email: zod
        .string()
        .trim()
        .toLowerCase()
        .email({
            message: "invalid email",
        })
        .nonempty({ message: "email is required" }),
    firstName: zod
        .string()
        .trim()
        .min(3, {
            message: "first name must be at least 3 characters",
        })
        .nonempty({ message: "first name is required" }),
    lastName: zod
        .string()
        .trim()
        .min(3, {
            message: "last name must be at least 3 characters",
        })
        .nonempty({ message: "last name is required" }),
    password: zod
        .string()
        .trim()
        .min(6, {
            message: "password must be at least 6 characters",
        })
        .nonempty({ message: "password is required" }),
});

const loginSchema = zod.object({
    email: zod
        .string()
        .trim()
        .email({
            message: "invalid email",
        })
        .nonempty({ message: "email is required" }),
    password: zod
        .string()
        .trim()
        .min(6, {
            message: "password must be at least 6 characters",
        })
        .nonempty({ message: "password is required" }),
});

// Tanents
const createTanentSchema = zod.object({
    name: zod
        .string()
        .trim()
        .min(3, {
            message: "name must be at least 3 characters",
        })
        .nonempty({ message: "tanent name is required" }),
    address: zod
        .string()
        .trim()
        .min(3, {
            message: "address must be at least 3 characters",
        })
        .nonempty({ message: "tanent address is required" }),
});

const updateTanentSchema = zod.object({
    name: zod
        .string()
        .trim()
        .min(3, {
            message: "name must be at least 3 characters",
        })
        .nonempty({ message: "tanent name is required" }).optional(),
    address: zod
        .string()
        .trim()
        .min(3, {
            message: "address must be at least 3 characters",
        })
        .nonempty({ message: "tanent address is required" }).optional(),
})
const tanentQueryValidator = zod.object({
    q: zod
        .string()
        .trim()
        .optional()
        .transform((val) => val || ""), // Convert undefined/null to empty string

    currentPage: zod
        .string()
        .optional()
        .transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 1 : num;
        }),

    perPage: zod
        .string()
        .optional()
        .transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 6 : num;
        }),
});

// Users validator
const createUserSchema = zod.object({
    email: zod
        .string()
        .trim()
        .toLowerCase()
        .email({
            message: "invalid email",
        })
        .nonempty({ message: "email is required" }),
    firstName: zod
        .string()
        .trim()
        .min(3, {
            message: "first name must be at least 3 characters",
        })
        .nonempty({ message: "first name is required" }),
    lastName: zod
        .string()
        .trim()
        .min(3, {
            message: "last name must be at least 3 characters",
        })
        .nonempty({ message: "last name is required" }),
    password: zod
        .string()
        .trim()
        .min(6, {
            message: "password must be at least 6 characters",
        })
        .nonempty({ message: "password is required" }),
    role: zod.enum(["customer", "manager", "admin"]).default("customer"),
    tanentId: zod.number().or(zod.string().refine((val) => !isNaN(parseInt(val, 10)), {
        message: "tanentId must be a number or a string that can be parsed to a number"
    })),
})
const updateUserSchema = zod.object({
    email: zod
        .string()
        .trim()
        .toLowerCase()
        .email({
            message: "Invalid email format",
        })
        .optional()
        .transform(val => val === "" ? undefined : val), // Handle empty strings
    firstName: zod
        .string()
        .trim()
        .min(3, {
            message: "First name must be at least 3 characters",
        })
        .optional()
        .transform(val => val === "" ? undefined : val),
    lastName: zod
        .string()
        .trim()
        .min(3, {
            message: "Last name must be at least 3 characters",
        })
        .optional()
        .transform(val => val === "" ? undefined : val),
    role: zod.enum(["customer", "manager", "admin", ""])
        .optional()
        .transform(val => val === "" ? undefined : val),
    tanentId: zod.union([
        zod.number().int().positive({
            message: "tanentId must be a positive integer"
        }),
        zod.string()
            .transform(val => parseInt(val, 10))
            .refine(val => !isNaN(val), {
                message: "tanentId must be a number or numeric string"
            })
            .refine(val => val > 0, {
                message: "tanentId must be positive"
            })
    ])
        .optional()
        .transform(val => typeof val === "string" && val === "" ? undefined : val)
}).refine(data => {
    // Ensure at least one field is provided for update
    return Object.values(data).some(val => val !== undefined);
}, {
    message: "At least one field must be provided for update",
    path: ["root"]
});


const usersQueryValidator = zod.object({
    q: zod
        .string()
        .trim()
        .optional()
        .transform((val) => val ?? ""), // undefined or null => ""

    role: zod
        .string()
        .optional()
        .transform((val) => val ?? ""),

    currentPage: zod
        .string()
        .optional()
        .transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 1 : num;
        }),

    perPage: zod
        .string()
        .optional()
        .transform((val) => {
            const num = Number(val);
            return isNaN(num) ? 6 : num;
        }),
       
});



export { registerUserSchema, loginSchema, createTanentSchema, tanentQueryValidator, updateTanentSchema, createUserSchema, updateUserSchema, usersQueryValidator,getZodError };

