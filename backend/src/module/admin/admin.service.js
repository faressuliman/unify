import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import Claim from "../../DB/models/claim.model.js";
import { pagination } from "../../utils/feature/pagination.js";
import { sendEmail } from "../../service/sendEmail.js";
import { decrypt } from "../../utils/encrypt/decrypt.js";
import {
  verificationApprovedTemplate,
  verificationRejectedTemplate,
} from "../../utils/sendEmail.events/verificationTemplate.js";

const decryptPhoneNumber = async (value) => {
  if (!value) return value;
  try {
    return await decrypt({ key: value, SECRET_KEY: process.env.SECRET_KEY });
  } catch (err) {
    return value;
  }
};

const toPlain = (doc) => (doc && typeof doc.toObject === "function" ? doc.toObject() : doc);

// ─── Get All Users ────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  const { page, limit, name, email } = req.query;

  const filter = { isdeleted: false };
  if (name) filter.name = new RegExp(name, "i");
  if (email) filter.email = new RegExp(email, "i");

  const result = await pagination({
    page, limit,
    model: User,
    filter,
    sort: { createdAt: -1 },
    select: "-password -otp -otpExpiry",
  });

  const users = await Promise.all(
    result.data.map(async (user) => {
      const plain = toPlain(user);
      return {
        ...plain,
        phoneNumber: await decryptPhoneNumber(plain.phoneNumber),
      };
    }),
  );

  return res.status(200).json({
    users,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};

// ─── Ban / Unban User ─────────────────────────────────────────────────────────
export const toggleBanUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.role === "admin") return next(new Error("Cannot ban admin", { cause: 403 }));

  user.isbanned = !user.isbanned;
  await user.save();

  return res.status(200).json({
    message: user.isbanned ? "User banned" : "User unbanned",
    isbanned: user.isbanned,
  });
};

// ─── Get All Pending Claims ───────────────────────────────────────────────────
export const getPendingClaims = async (req, res, next) => {
  const { page, limit } = req.query;

  const result = await pagination({
    page, limit,
    model: Claim,
    filter: { status: "pending" },
    sort: { createdAt: 1 },
    populate: [
      { path: "postId", select: "name postType status" },
      { path: "claimUserId", select: "name email phoneNumber" },
    ],
  });

  const claims = await Promise.all(
    result.data.map(async (claim) => {
      const plainClaim = toPlain(claim);
      const plainUser = toPlain(plainClaim?.claimUserId);
      if (!plainUser) return plainClaim;
      const phoneNumber = await decryptPhoneNumber(plainUser.phoneNumber);
      return {
        ...plainClaim,
        claimUserId: { ...plainUser, phoneNumber },
      };
    }),
  );

  return res.status(200).json({
    claims,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};

// ─── Get All Claims (any status) ──────────────────────────────────────────────
export const getAllClaims = async (req, res, next) => {
  const { page, limit, status } = req.query;

  const filter = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const result = await pagination({
    page, limit,
    model: Claim,
    filter,
    sort: { createdAt: -1 },
    populate: [
      { path: "postId", select: "name postType status" },
      { path: "claimUserId", select: "name email phoneNumber" },
    ],
  });

  const claims = await Promise.all(
    result.data.map(async (claim) => {
      const plainClaim = toPlain(claim);
      const plainUser = toPlain(plainClaim?.claimUserId);
      if (!plainUser) return plainClaim;
      const phoneNumber = await decryptPhoneNumber(plainUser.phoneNumber);
      return {
        ...plainClaim,
        claimUserId: { ...plainUser, phoneNumber },
      };
    }),
  );

  return res.status(200).json({
    claims,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  const [
    totalUsers, totalPosts, activeMissing,
    foundPosts, resolvedPosts, pendingClaims, pendingVerifications,
  ] = await Promise.all([
    User.countDocuments({ isdeleted: false }),
    Post.countDocuments(),
    Post.countDocuments({ postType: "missing", status: "active" }),
    Post.countDocuments({ postType: "found", status: "active" }),
    Post.countDocuments({ status: "resolved" }),
    Claim.countDocuments({ status: "pending" }),
    User.countDocuments({ isdeleted: false, isVerified: false }),
  ]);

  return res.status(200).json({
    stats: {
      totalUsers,
      totalPosts,
      activeMissing,
      foundPosts,
      resolvedPosts,
      pendingClaims,
      pendingVerifications,
    },
  });
};

// ─── Pending Verifications (users awaiting ID review) ────────────────────────
export const getPendingVerifications = async (req, res, next) => {
  const { page, limit, name, email } = req.query;

  const filter = { isdeleted: false, isVerified: false };
  if (name) filter.name = new RegExp(name, "i");
  if (email) filter.email = new RegExp(email, "i");

  const result = await pagination({
    page, limit,
    model: User,
    filter,
    sort: { createdAt: -1 },
    select: "name email phoneNumber birthDate gender address idImagePath isVerified createdAt",
  });

  const users = await Promise.all(
    result.data.map(async (user) => {
      const plain = toPlain(user);
      return {
        ...plain,
        phoneNumber: await decryptPhoneNumber(plain.phoneNumber),
      };
    }),
  );

  return res.status(200).json({
    users,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};

// ─── Approve / Verify a user account ─────────────────────────────────────────
export const verifyUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.isVerified) {
    return res.status(200).json({ message: "User already verified", user });
  }

  user.isVerified = true;
  await user.save();

  // Fire-and-forget the approval email; don't block the API response on SMTP.
  sendEmail(
    user.email,
    "Your UNIFY account has been verified",
    verificationApprovedTemplate({
      name: user.name,
      loginUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login`
        : undefined,
    }),
  ).catch((err) =>
    console.warn("[admin.verifyUser] failed to send approval email:", err?.message),
  );

  return res.status(200).json({
    message: "User verified successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
};

// ─── Reject a verification (soft-deletes the unverified account) ─────────────
//
// We don't want rejected applicants to keep stale rows around: their record
// gets `isdeleted: true`, freeing the email for a clean re-registration with
// a clearer ID document. An explanatory email is sent on the way out.
export const rejectVerification = async (req, res, next) => {
  const { reason } = req.body || {};
  const user = await User.findById(req.params.id);
  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.isVerified) {
    return next(new Error("User is already verified", { cause: 400 }));
  }
  if (user.role === "admin") {
    return next(new Error("Cannot reject an admin", { cause: 403 }));
  }

  user.isdeleted = true;
  await user.save();

  sendEmail(
    user.email,
    "UNIFY account verification update",
    verificationRejectedTemplate({ name: user.name, reason }),
  ).catch((err) =>
    console.warn("[admin.rejectVerification] failed to send email:", err?.message),
  );

  return res.status(200).json({ message: "Verification rejected" });
};

// ─── Get All Posts (admin moderation list) ───────────────────────────────────
export const getAllPostsAdmin = async (req, res, next) => {
  const { page, limit, postType, status, name } = req.query;

  const filter = {};
  if (postType) filter.postType = postType;
  if (status) filter.status = status;
  if (name) filter.name = new RegExp(name, "i");

  const result = await pagination({
    page, limit,
    model: Post,
    filter,
    sort: { createdAt: -1 },
    populate: [{ path: "userId", select: "name email" }],
  });

  return res.status(200).json({
    posts: result.data,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};
