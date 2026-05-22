import User from "../../DB/models/user.model.js";
import Post from "../../DB/models/post.model.js";
import Chat from "../../DB/models/chat.model.js";
import { encrypt } from "../../utils/encrypt/encrypt.js";
import { decrypt } from "../../utils/encrypt/decrypt.js";
import bcrypt from "bcrypt";

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
      phoneNumber,
      birthDate: user.birthDate,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
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
  const { name, phoneNumber, birthDate, email } = req.body;

  const updateData = {};
  let emailChanged = false;
  let otpCode = null;

  if (name) updateData.name = name;
  if (phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }
  if (birthDate) updateData.birthDate = birthDate;
  if (email && email !== req.user.email) {
    // Check if new email is already in use
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new Error("Email already registered", { cause: 409 }));
    }
    updateData.email = email;
    updateData.isEmailVerified = false;
    emailChanged = true;

    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    updateData.otp = bcrypt.hashSync(
      otpCode,
      parseInt(process.env.SALT_ROUND || 8),
    );
    updateData.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }
  if (req.file) updateData.profilePicture = req.file.path;
  const updated = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    select: "-password -otp -otpExpiry",
  });

  if (!updated) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // Send a confirmation email if the email was changed
  if (emailChanged && otpCode) {
    import("../../service/sendEmail.js").then(({ sendEmail }) => {
      sendEmail(
        email,
        "Verify Your New Email",
        `<p>Hello ${updated.name},</p>
         <p>Your email address has been updated. Please verify your new email by entering the following OTP code:</p>
         <h2 style="color: #4F46E5; letter-spacing: 2px;">${otpCode}</h2>
         <p>This code will expire in 10 minutes.</p>
         <p>If you did not make this change, please contact support immediately.</p>`,
      ).catch(console.error);
    });
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
      isEmailVerified: updated.isEmailVerified,
      idImagePath: updated.idImagePath,
      profilePicture: updated.profilePicture,
      createdAt: updated.createdAt,
      lastLoginAt: updated.lastLoginAt,
    },
  });
};

// ─── Verify New Email ─────────────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.isEmailVerified)
    return next(new Error("Email is already verified", { cause: 400 }));

  if (!user.otp || !user.otpExpiry)
    return next(new Error("No OTP requested", { cause: 400 }));
  if (new Date() > user.otpExpiry)
    return next(new Error("OTP has expired", { cause: 400 }));

  const isValid = bcrypt.compareSync(otp, user.otp);
  if (!isValid) return next(new Error("Invalid OTP", { cause: 400 }));

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      isEmailVerified: true,
      $unset: { otp: 1, otpExpiry: 1 },
    },
    { new: true, select: "-password -otp -otpExpiry" },
  );

  return res
    .status(200)
    .json({ message: "Email verified successfully", user: updatedUser });
};
// ─── Block User ──────────────────────────────────────────────────────────────
export const blockUser = async (req, res, next) => {
  const { userId } = req.params;

  // Add the user to the current user's blocked list
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { blockedUsers: userId },
  });

  // Erase any existing chats between them
  await Chat.findOneAndDelete({
    $or: [
      { initiatorUserId: req.user._id, responderUserId: userId },
      { initiatorUserId: userId, responderUserId: req.user._id },
    ],
  });

  return res.status(200).json({ message: "User blocked successfully" });
};

// ─── Get Blocked Users ────────────────────────────────────────────────────────
export const getBlockedUsers = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "blockedUsers",
    "name email idImagePath",
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
