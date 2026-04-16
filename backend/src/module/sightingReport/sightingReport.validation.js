import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const createSightingSchema = joi
  .object({
    missingPersonId: genralrules.id.required(),
    confidence: joi
      .string()
      .valid("not_sure", "possibly", "pretty_sure", "very_sure")
      .required(),
    seenAt: joi.date().required(),
    address: joi.string().required(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    description: joi.string().min(5).required(),
    additionalDetails: joi.string().optional(),
    reporterName: joi.string().required(),
    reporterPhone: joi.string().length(11).required(),
  })
  .unknown(true);
