import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const createClaimSchema = joi
  .object({
    postId: genralrules.id.required(),
    claimType: joi.string().required(),
    additionalInfo: joi.string().allow("").optional(),
    document: genralrules.file.optional(),
    authorization: joi.string().required(),
  })
  .unknown(true);

export const reviewClaimSchema = joi
  .object({
    result: joi.string().valid("approved", "rejected").required(),
    notes: joi.string().optional(),
    authorization: joi.string().required(),
    id: genralrules.id.required(),
  })
  .unknown(true);

export const aiReviewSchema = joi
  .object({
    aiDecision: joi.string().valid("approved", "rejected", "uncertain").required(),
    aiConfidenceScore: joi.number().min(0).max(100).required(),
    notes: joi.string().optional(),
    verificationType: joi.string().optional(),
    authorization: joi.string().required(),
    id: genralrules.id.required(),
  })
  .unknown(true);
