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
    email: zod.string().trim().email({
        message: "invalid email",
    }).nonempty({ message: "email is required" }),
    firstName: zod.string().trim().min(3, {
        message: "first name must be at least 3 characters",
    }).nonempty({ message: "first name is required" }),
    lastName: zod.string().trim().min(3, {
        message: "last name must be at least 3 characters",
    }).nonempty({ message: "last name is required" }),
    password: zod.string().trim().min(6, {
        message: "password must be at least 6 characters",
    }).nonempty({ message: "password is required" }),
});

export { registerUserSchema, getZodError };
