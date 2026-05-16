import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const createSightingSchema = joi
  .object({
    missingPersonId: genralrules.id.required(),
    confidence: joi
      .string()
      .valid("not_sure", "possibly", "pretty_sure", "very_sure")
      .required(),
    seenAt: joi.string().required(),
    address: joi.string().required(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    description: joi.string().min(2).required(),
    additionalDetails: joi.string().allow("").optional(),
    reporterName: joi.string().required(),
    reporterPhone: joi.string().min(8).max(20).required(),
  })
  .unknown(true);
