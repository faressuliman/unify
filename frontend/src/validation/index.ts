import * as z from "zod"

export const loginSchema = z.object({
    email: z.string().trim().nonempty({ message: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string().trim().nonempty({ message: "Password is required" })
})

export const signUpSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Full Name is required" }).min(2, { message: "Full Name must be at least 2 characters" }),
    email: z.string().trim().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    age: z.coerce.number().min(18, { message: "You must be at least 18 years old" }).max(90, { message: "Age must be 90 or less" }),
    phoneNumber: z.string().trim().min(1, { message: "Phone Number is required" }).length(11, { message: "Phone number must be exactly 11 digits" }),
    password: z.string().trim()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string().trim().min(1, { message: "Confirm Password is required" }),
    idPicture: z.any().refine((file) => file !== null && file !== undefined && file !== '', "ID picture is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().nonempty({ message: "Email is required" }).email({ message: "Invalid email format" }),
})

export const resetPasswordSchema = z.object({
    password: z.string().trim().nonempty({ message: "Password is required" }).min(6, { message: "Password must be at least 6 characters" }),
    confirm_password: z.string().trim().nonempty({ message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
})