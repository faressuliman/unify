import SightingReport from "../../DB/models/sightingReport.model.js";
import Post from "../../DB/models/post.model.js";
import { createNotification } from "../notification/notification.helper.js";
import { verifytoken } from "../../utils/token/verifyToken.js";

export const createSighting = async (req, res, next) => {
  const {
    missingPersonId, confidence, seenAt,
    address, latitude, longitude,
    description, additionalDetails,
    reporterName, reporterPhone,
  } = req.body;

  let reporterId = null;
  if (req.headers.authorization) {
    try {
      const decoded = await verifytoken({
        token: req.headers.authorization,
        SIGNATURE: process.env.ACCESS_SIGNATURE,
      });
      if (decoded?.id) {
        reporterId = decoded.id;
      }
    } catch (error) {
      // Ignore token errors, submit anonymously
    }
  }

  const post = await Post.findById(missingPersonId);
  if (!post) return next(new Error("Missing person post not found", { cause: 404 }));
  if (post.postType !== "missing") {
    return next(new Error("Sighting reports only apply to missing persons", { cause: 400 }));
  }

  const report = await SightingReport.create({
    missingPersonId,
    confidence,
    seenAt,
    location: { address, latitude, longitude },
    description,
    additionalDetails,
    reporterName,
    reporterPhone,
    reporterId,
  });

  await createNotification({
    userId: post.userId,
    postId: post._id,
    type: "new_sighting",
    referenceId: report._id.toString(),
  });

  return res.status(201).json({ message: "Sighting report submitted", report });
};

export const getSightingsByPost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const isOwner = post.userId?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isReporter = await SightingReport.exists({
    missingPersonId: postId,
    reporterId: req.user._id,
  });
  if (!isOwner && !isAdmin && !isReporter) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  const reportsQuery = isOwner || isAdmin
    ? { missingPersonId: postId }
    : { missingPersonId: postId, reporterId: req.user._id };

  const reports = await SightingReport.find(reportsQuery)
    .populate("missingPersonId", "name userId")
    .sort({
      createdAt: -1,
    });

  return res.status(200).json({ reports });
};

export const getMySightings = async (req, res, next) => {
  const reports = await SightingReport.find({ reporterId: req.user._id })
    .populate("missingPersonId", "name _id userId")
    .sort({ createdAt: -1 });

  return res.status(200).json({ reports });
};
