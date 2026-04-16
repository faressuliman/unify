import SightingReport from "../../DB/models/sightingReport.model.js";
import Post from "../../DB/models/post.model.js";
import Notification from "../../DB/models/notification.model.js";

// ─── Create Sighting Report ───────────────────────────────────────────────────
export const createSighting = async (req, res, next) => {
  const {
    missingPersonId, confidence, seenAt,
    address, latitude, longitude,
    description, additionalDetails,
    reporterName, reporterPhone,
  } = req.body;

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
  });

  // Notify the post owner
  await Notification.create({
    userId: post.userId,
    postId: post._id,
    type: "new_sighting",
  });

  return res.status(201).json({ message: "Sighting report submitted", report });
};

// ─── Get Sightings For a Post ─────────────────────────────────────────────────
export const getSightingsByPost = async (req, res, next) => {
  const { postId } = req.params;

  const reports = await SightingReport.find({ missingPersonId: postId }).sort({
    createdAt: -1,
  });

  return res.status(200).json({ reports });
};
