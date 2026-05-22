import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const updateProfileSchema = joi
  .object({
    name: joi.string().min(2).max(50).optional(),
    email: genralrules.email.optional(),
    phoneNumber: joi.string().length(11).optional(),
    birthDate: joi.date().optional(),
    file: genralrules.file.optional(),
    authorization: joi.string().required(),
  })
  .unknown(true);
