import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import Claim from "../../DB/models/claim.model.js";
import { pagination } from "../../utils/feature/pagination.js";

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

  return res.status(200).json({
    users: result.data,
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

  return res.status(200).json({
    claims: result.data,
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

  return res.status(200).json({
    claims: result.data,
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
    foundPosts, resolvedPosts, pendingClaims,
  ] = await Promise.all([
    User.countDocuments({ isdeleted: false }),
    Post.countDocuments(),
    Post.countDocuments({ postType: "missing", status: "active" }),
    Post.countDocuments({ postType: "found", status: "active" }),
    Post.countDocuments({ status: "resolved" }),
    Claim.countDocuments({ status: "pending" }),
  ]);

  return res.status(200).json({
    stats: {
      totalUsers,
      totalPosts,
      activeMissing,
      foundPosts,
      resolvedPosts,
      pendingClaims,
    },
  });
};
