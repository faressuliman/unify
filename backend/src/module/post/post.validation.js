import joi from "joi";
import { genralrules } from "../../utils/generalRules/index.js";

export const createPostSchema = joi
  .object({
    postType: joi.string().valid("missing", "found").required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    age: joi.number().min(0).max(120).required(),
    ageUnit: joi.string().valid("years", "months", "days").default("years"),
    gender: joi.string().valid("male", "female", "unknown").required(),
    hairColour: joi.string().required(),
    eyeColour: joi.string().required(),
    clothesDescription: joi.string().min(10).required(),
    city: joi.string().required(),
    lastSeenLocation: joi.when("postType", {
      is: "missing",
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    lastSeenDate: joi.when("postType", {
      is: "missing",
      then: joi.date().required(),
      otherwise: joi.date().optional(),
    }),
    foundLocation: joi.when("postType", {
      is: "found",
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
    affiliation: joi
      .string()
      .valid("none", "shelter", "hospital", "nonprofit", "government")
      .optional(),
    organizationName: joi.string().optional(),
    reporterPhone: joi.string().optional(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional(),
    files: joi.any().optional(),
    authorization: joi.string().required(),
  })
  .unknown(true);

export const updatePostSchema = joi
  .object({
    status: joi.string().valid("active", "resolved", "closed").optional(),
    clothesDescription: joi.string().optional(),
    authorization: joi.string().required(),
    id: genralrules.id.required(),
  })
  .unknown(true);

export const getPostsSchema = joi
  .object({
    postType: joi.string().valid("missing", "found").optional(),
    status: joi.string().valid("active", "resolved", "closed").optional(),
    gender: joi.string().valid("male", "female", "unknown").optional(),
    city: joi.string().optional(),
    hairColour: joi.string().optional(),
    eyeColour: joi.string().optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    ageMin: joi.number().optional(),
    ageMax: joi.number().optional(),
    dateMissing: joi.date().optional(),
    page: joi.number().optional(),
    limit: joi.number().optional(),
  })
  .unknown(true);
