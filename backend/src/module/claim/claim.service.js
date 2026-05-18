import Claim from "../../DB/models/claim.model.js";
import AIVerification from "../../DB/models/aiVerification.model.js";
import AdminVerification from "../../DB/models/adminVerification.model.js";
import Post from "../../DB/models/post.model.js";
import Chat from "../../DB/models/chat.model.js";
import { createNotification } from "../notification/notification.helper.js";

// ─── Create Claim ─────────────────────────────────────────────────────────────
export const createClaim = async (req, res, next) => {
  const { postId, claimType, additionalInfo } = req.body;

  const post = await Post.findById(postId);
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const existing = await Claim.findOne({ postId, claimUserId: req.user._id });
  if (existing)
    return next(
      new Error("You already submitted a claim for this post", { cause: 409 }),
    );

  const documentPath = req.file?.path;

  const claim = await Claim.create({
    postId,
    claimType,
    additionalInfo,
    claimUserId: req.user._id,
    documentPath,
    status: "pending",
  });

  // Notify post owner
  await createNotification({
    userId: post.userId,
    postId: post._id,
    type: "new_claim",
  });

  return res.status(201).json({ message: "Claim submitted", claim });
};

// ─── Get My Claims ────────────────────────────────────────────────────────────
export const getMyClaims = async (req, res, next) => {
  const claims = await Claim.find({ claimUserId: req.user._id })
    .populate({
      path: "postId",
      select: "name postType status userId",
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ claims });
};

// ─── Get Claims For a Post (owner or admin) ───────────────────────────────────
export const getClaimsByPost = async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  if (
    post.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  const claims = await Claim.find({ postId: req.params.postId })
    .populate("claimUserId", "name email phoneNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json({ claims });
};

// ─── AI Review Claim ──────────────────────────────────────────────────────────
export const aiReviewClaim = async (req, res, next) => {
  const { aiDecision, aiConfidenceScore, notes, verificationType } = req.body;

  const claim = await Claim.findById(req.params.id);
  if (!claim) return next(new Error("Claim not found", { cause: 404 }));

  const existing = await AIVerification.findOne({ claimId: claim._id });
  if (existing)
    return next(new Error("AI review already done", { cause: 409 }));

  const aiVerif = await AIVerification.create({
    claimId: claim._id,
    aiDecision,
    aiConfidenceScore,
    notes,
    verificationType,
    verifiedAt: new Date(),
  });

  return res.status(201).json({ message: "AI review recorded", aiVerif });
};

// ─── Admin Review Claim ───────────────────────────────────────────────────────
export const adminReviewClaim = async (req, res, next) => {
  const { result, notes } = req.body;

  const claim = await Claim.findById(req.params.id);
  if (!claim) return next(new Error("Claim not found", { cause: 404 }));

  const existing = await AdminVerification.findOne({ claimId: claim._id });
  if (existing)
    return next(new Error("Admin review already done", { cause: 409 }));

  const adminVerif = await AdminVerification.create({
    claimId: claim._id,
    adminId: req.user._id,
    result,
    notes,
    verifiedAt: new Date(),
  });

  // Update claim status
  claim.status = result;
  claim.reviewedAt = new Date();
  await claim.save();

  // If approved, resolve the post and create chat between claimant and post owner
  if (result === "approved") {
    await Post.findByIdAndUpdate(claim.postId, { status: "resolved" });

    // Create chat between claimant and post owner
    const post = await Post.findById(claim.postId).populate("userId", "_id");
    if (post && post.userId) {
      const claimantId = claim.claimUserId;
      const postOwnerId = post.userId._id;

      // Check if chat already exists
      let existingChat = await Chat.findOne({
        $or: [
          { initiatorUserId: claimantId, responderUserId: postOwnerId },
          { initiatorUserId: postOwnerId, responderUserId: claimantId },
        ],
      });

      if (!existingChat) {
        // Create new chat
        existingChat = await Chat.create({
          initiatorUserId: claimantId,
          responderUserId: postOwnerId,
          isActive: true,
        });
      }
    }

    await createNotification({
      userId: claim.claimUserId,
      postId: claim.postId,
      type: "claim_approved",
    });
  } else {
    await createNotification({
      userId: claim.claimUserId,
      postId: claim.postId,
      type: "claim_rejected",
      message: notes,
    });
  }

  return res.status(201).json({ message: "Admin review recorded", adminVerif });
};
