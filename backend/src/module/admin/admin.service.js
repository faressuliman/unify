import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import Claim from "../../DB/models/claim.model.js";
import ContactMessage from "../../DB/models/contactMessage.model.js";
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
    const decrypted = await decrypt({
      key: value,
      SECRET_KEY: process.env.SECRET_KEY,
    });
    return decrypted || value;
  } catch (err) {
    return value;
  }
};

const toPlain = (doc) =>
  doc && typeof doc.toObject === "function" ? doc.toObject() : doc;

// ─── Get All Users ────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  const { page, limit, name, email } = req.query;

  const filter = { isdeleted: false };
  if (name) filter.name = new RegExp(name, "i");
  if (email) filter.email = new RegExp(email, "i");

  const result = await pagination({
    page,
    limit,
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
  if (user.role === "admin")
    return next(new Error("Cannot ban admin", { cause: 403 }));

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
    page,
    limit,
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
    page,
    limit,
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
    totalUsers,
    totalPosts,
    activeMissing,
    foundPosts,
    resolvedPosts,
    pendingClaims,
    pendingVerifications,
    pendingContactMessages,
    pendingUserReports,
  ] = await Promise.all([
    User.countDocuments({ isdeleted: false }),
    Post.countDocuments(),
    Post.countDocuments({ postType: "missing", status: "active" }),
    Post.countDocuments({ postType: "found", status: "active" }),
    Post.countDocuments({ status: "resolved" }),
    Claim.countDocuments({ status: "pending" }),
    User.countDocuments({ isdeleted: false, isVerified: false }),
    ContactMessage.countDocuments({
      subject: { $not: /^User Report:/i },
      isReplied: false,
    }),
    ContactMessage.countDocuments({
      subject: { $regex: /^User Report:/i },
      isReplied: false,
    }),
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
      pendingContactMessages,
      pendingUserReports,
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
    page,
    limit,
    model: User,
    filter,
    sort: { createdAt: -1 },
    select:
      "name email phoneNumber birthDate gender address idImagePath isVerified createdAt",
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
    console.warn(
      "[admin.verifyUser] failed to send approval email:",
      err?.message,
    ),
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
    console.warn(
      "[admin.rejectVerification] failed to send email:",
      err?.message,
    ),
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
    page,
    limit,
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

// ─── Get Contact Messages ─────────────────────────────────────────────────────
export const getContactMessages = async (req, res, next) => {
  const { page, limit, type = "contact" } = req.query;

  const filter = {};
  if (type === "report") {
    filter.subject = { $regex: /^User Report:/i };
  } else if (type === "contact") {
    filter.subject = { $not: /^User Report:/i };
  }

  const result = await pagination({
    page,
    limit,
    model: ContactMessage,
    filter,
    sort: { createdAt: -1 },
  });

  return res.status(200).json({
    messages: result.data,
    page: result.page,
    limit: result.limit,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  });
};

// ─── Reply to Contact Message ─────────────────────────────────────────────────
export const replyToContactMessage = async (req, res, next) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    return next(new Error("Reply message is required", { cause: 400 }));
  }

  const message = await ContactMessage.findById(id);
  if (!message) {
    return next(new Error("Contact message not found", { cause: 404 }));
  }

  // Send email to the user
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Re: ${message.subject}</h2>
      <p>Dear ${message.name},</p>
      <p>${replyMessage.replace(/\n/g, "<br/>")}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">Your original message:</p>
      <blockquote style="color: #666; font-size: 12px; border-left: 3px solid #ccc; padding-left: 10px;">
        ${message.message.replace(/\n/g, "<br/>")}
      </blockquote>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Support Team @ UNIFY</p>
    </div>
  `;

  await sendEmail(message.email, `Re: ${message.subject}`, emailHtml);

  message.isReplied = true;
  await message.save();

  return res.status(200).json({ message: "Reply sent successfully" });
};
