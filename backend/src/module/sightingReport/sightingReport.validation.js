import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const createSightingSchema = joi
  .object({
    missingPersonId: genralrules.id.required(),
    confidence: joi
      .string()
      .valid("not_sure", "possibly", "pretty_sure", "very_sure")
      .required(),
    // Accept freeform date/time input from reporter as string (not strict Date)
    seenAt: joi.string().required(),
    address: joi.string().required(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    description: joi.string().min(5).required(),
    // Allow empty additionalDetails (reporters may leave this blank)
    additionalDetails: joi.string().allow('').optional(),
    reporterName: joi.string().required(),
    reporterPhone: joi.string().length(11).required(),
  })
  .unknown(true);
