import zod from "zod";

const getZodError = (validator :{
    error: {
        issues: {
            message: string;
        }[];
    };
} ) => {
    return validator.error.issues[0].message;
}


const registerUserSchema = zod.object({
    email: zod.string({ message: "email is required" }).email({
        message: "invalid email",
    }),
    firstName: zod.string({ message: "first name is required" }).min(3, {
        message: "first name must be at least 3 characters",
    }),
    lastName: zod.string({ message: "last name is required" }).min(3, {
        message: "last name must be at least 3 characters",
    }),
    password: zod.string({ message: "password is required" }).min(6, {
        message: "password must be at least 6 characters",
    }),
});

export { registerUserSchema, getZodError };