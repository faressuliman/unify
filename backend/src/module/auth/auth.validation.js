import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const registerSchema = joi
  .object({
    name: joi.string().min(2).max(50).required(),
    email: genralrules.email.required(),
    password: genralrules.password
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain uppercase, number, and special character",
      }),
    confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
    }),
    phoneNumber: joi.string().length(11).required(),
    birthDate: joi.date().optional(),
    file: genralrules.file.optional(),
  })
  .unknown(false);

export const loginSchema = joi
  .object({
    email: genralrules.email.required(),
    password: genralrules.password.required(),
  })
  .unknown(false);

export const forgotPasswordSchema = joi
  .object({
    email: genralrules.email.required(),
  })
  .unknown(false);

export const resetPasswordSchema = joi
  .object({
    email: genralrules.email.required(),
    otp: joi.string().required(),
    password: genralrules.password
      .min(8)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
    }),
  })
  .unknown(false);
