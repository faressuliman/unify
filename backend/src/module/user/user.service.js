import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import Chat from "../../DB/models/chat.model.js";
import { decrypt } from "../../utils/encrypt/decrypt.js";

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

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  const user = req.user;

  const posts = await Post.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  const phoneNumber = await decryptPhoneNumber(user.phoneNumber);

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      city: user.city,
      phoneNumber,
      birthDate: user.birthDate,
      role: user.role,
      isVerified: user.isVerified,
      idImagePath: user.idImagePath,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    posts,
  });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  const { name, phoneNumber, birthDate, email, city } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }
  if (birthDate) updateData.birthDate = birthDate;
  if (city) updateData.city = city;
  if (email && email !== req.user.email) {
    // Check if new email is already in use
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new Error("Email already registered", { cause: 409 }));
    }
    updateData.email = email;
  }
  if (req.file) updateData.profilePicture = req.file.path;
  const updated = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    select: "-password -otp -otpExpiry",
  });

  if (!updated) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const decryptedPhoneNumber = await decryptPhoneNumber(updated.phoneNumber);

  return res.status(200).json({
    message: "Profile updated",
    user: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      city: updated.city,
      phoneNumber: decryptedPhoneNumber,
      birthDate: updated.birthDate,
      role: updated.role,
      isVerified: updated.isVerified,
      idImagePath: updated.idImagePath,
      profilePicture: updated.profilePicture,
      createdAt: updated.createdAt,
      lastLoginAt: updated.lastLoginAt,
    },
  });
};
// ─── Block User ──────────────────────────────────────────────────────────────
export const blockUser = async (req, res, next) => {
  const { userId } = req.params;

  // Add the user to the current user's blocked list
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { blockedUsers: userId },
  });

  // Keep chat history for admin review but hide it from users.
  await Chat.findOneAndUpdate(
    {
      $or: [
        { initiatorUserId: req.user._id, responderUserId: userId },
        { initiatorUserId: userId, responderUserId: req.user._id },
      ],
    },
    { $set: { isActive: false } },
  );

  return res.status(200).json({ message: "User blocked successfully" });
};

// ─── Get Blocked Users ────────────────────────────────────────────────────────
export const getBlockedUsers = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "blockedUsers",
    "name email profilePicture",
  );
  if (!user) return next(new Error("User not found", { cause: 404 }));
  return res.status(200).json({ blockedUsers: user.blockedUsers || [] });
};

// ─── Unblock User ─────────────────────────────────────────────────────────────
export const unblockUser = async (req, res, next) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { blockedUsers: userId },
  });
  return res.status(200).json({ message: "User unblocked successfully" });
};
