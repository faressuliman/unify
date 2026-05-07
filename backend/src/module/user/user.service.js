import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import { encrypt } from "../../utils/encrypt/encrypt.js";
import { decrypt } from "../../utils/encrypt/decrypt.js";

const decryptPhoneNumber = async (value) => {
  if (!value) return value;
  try {
    return await decrypt({ key: value, SECRET_KEY: process.env.SECRET_KEY });
  } catch (err) {
    return value;
  }
};

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  const user = req.user;

  const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
  const phoneNumber = await decryptPhoneNumber(user.phoneNumber);

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber,
      birthDate: user.birthDate,
      role: user.role,
      isVerified: user.isVerified,
      idImagePath: user.idImagePath,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    posts,
  });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  const { name, phoneNumber, birthDate } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }
  if (birthDate) updateData.birthDate = birthDate;
  if (req.file) updateData.idImagePath = req.file.path;

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
      phoneNumber: decryptedPhoneNumber,
      birthDate: updated.birthDate,
      role: updated.role,
      isVerified: updated.isVerified,
      idImagePath: updated.idImagePath,
      createdAt: updated.createdAt,
      lastLoginAt: updated.lastLoginAt,
    },
  });
};
