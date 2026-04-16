import User from "../../DB/models/user.model.js";
import { Hash } from "../../utils/Hash/hash.js";
import { compare } from "../../utils/Hash/compare.js";
import { generatetoken } from "../../utils/token/generateToken.js";
import { sendEmail } from "../../service/sendEmail.js";
import { html } from "../../utils/sendEmail.events/template.js";
import { encrypt } from './../../utils/encrypt/encrypt.js';

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  const { name, email, password, phoneNumber, birthDate } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new Error("Email already registered", { cause: 409 }));
  }

  let idImagePath;
  if (req.file) {
    idImagePath = req.file.path;
  }

  const hashedPassword = await Hash({ key: password });
  const encryptedphoneNumber = await encrypt({ key: phoneNumber, SECRET_KEY: process.env.SECRET_KEY });

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber:encryptedphoneNumber,
    birthDate,
    idImagePath,
  });

  return res.status(201).json({ message: "Registered successfully", user });
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid credentials", { cause: 401 }));

  if (user.isdeleted) return next(new Error("Account deleted", { cause: 403 }));
  if (user.isbanned) return next(new Error("Account banned", { cause: 403 }));

  const isMatch = await compare({ key: password, hashed: user.password });
  if (!isMatch) return next(new Error("Invalid credentials", { cause: 401 }));

  const accessToken = await generatetoken({
    payload: { id: user._id, role: user.role },
    SIGNATURE: process.env.ACCESS_SIGNATURE,
    option: { expiresIn: "7d" },
  });

  user.lastLoginAt = new Date();
  await user.save();

  return res.status(200).json({
    message: "Logged in successfully",
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("Email not found", { cause: 404 }));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  user.otp = await Hash({ key: otp });
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP - UNIFY",
    html({ message: "Your password reset OTP is:", code: otp })
  );

  return res.status(200).json({ message: "OTP sent to your email" });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("Email not found", { cause: 404 }));

  if (!user.otp || !user.otpExpiry) {
    return next(new Error("No OTP requested", { cause: 400 }));
  }

  if (new Date() > user.otpExpiry) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  const isOtpValid = await compare({ key: otp, hashed: user.otp });
  if (!isOtpValid) return next(new Error("Invalid OTP", { cause: 400 }));

  user.password = await Hash({ key: password });
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.changeCredentialsTime = new Date();
  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};
