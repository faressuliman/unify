import * as z from "zod"

export const loginSchema = z.object({
    email: z.string().trim().nonempty({ message: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string().trim().nonempty({ message: "Password is required" })
})

export const signUpSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Full Name is required" }).min(2, { message: "Full Name must be at least 2 characters" }),
    email: z.string().trim().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    age: z.coerce.number().min(18, { message: "You must be at least 18 years old" }).max(120, { message: "Invalid age" }),
    phoneNumber: z.string().trim().min(1, { message: "Phone Number is required" }).min(10, { message: "Phone number is too short" }),
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

export const checkoutSchema = z.object({
    first_name: z.string().trim().nonempty({ message: "First Name is required" }),
    last_name: z.string().trim().nonempty({ message: "Last Name is required" }),
    email: z.string().trim().nonempty({ message: "Email is required" }).email({ message: "Invalid email format" }),
    phone: z.string().trim().nonempty({ message: "Phone is required" }),
    address: z.string().trim().nonempty({ message: "Address is required" }),
    city: z.string().trim().nonempty({ message: "City is required" }),
    postal_code: z.string().trim().optional(),
    order_notes: z.string().trim().optional(),
    card_number: z.string().trim().optional(),
    payment_method: z.enum(["card", "cod"]),
})
    .refine(
        (data) =>
            data.payment_method !== "card" ||
            (data.card_number !== undefined && data.card_number !== ""),
        {
            path: ["card_number"],
            message: "Card number is required when paying by card",
        }
    )