import User from "../../DB/models/user.model.js";
import { Hash } from "../../utils/Hash/hash.js";
import { compare } from "../../utils/Hash/compare.js";
import { generatetoken } from "../../utils/token/generateToken.js";
import { sendEmail } from "../../service/sendEmail.js";
import { html } from "../../utils/sendEmail.events/template.js";
import { encrypt } from './../../utils/encrypt/encrypt.js';
import cloudinary from "../../utils/cloudinary/index.js";
import { AppError } from "../../utils/globalErrorHandling/index.js";

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    console.log("[register] START — body keys:", Object.keys(req.body), "| has file:", !!req.file);
    const { name, email, password, phoneNumber, birthDate, city } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing.isbanned) {
      return next(new AppError("Account banned", 403));
    }

    if (existing && !existing.isdeleted) {
      return next(new AppError("Email already registered", 409));
    }

    let idImagePath;
    if (req.file) {
      console.log("[register] Uploading to Cloudinary...");
      try {
        idImagePath = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "unify/ids", resource_type: "auto" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            },
          );
          uploadStream.end(req.file.buffer);
        });
        console.log("[register] Cloudinary upload OK:", idImagePath);
      } catch (cloudErr) {
        console.error("[register] Cloudinary upload FAILED:", cloudErr.message, cloudErr);
        return next(new AppError("Image upload failed", 500));
      }
    }

    console.log("[register] Hashing password...");
    const hashedPassword = await Hash({ key: password });

    if (existing && existing.isdeleted) {
      console.log("[register] Restoring deleted account...");
      existing.name = name;
      existing.password = hashedPassword;
      existing.phoneNumber = phoneNumber;
      existing.birthDate = birthDate;
      existing.city = city;
      existing.idImagePath = idImagePath;
      existing.isdeleted = false;
      existing.isVerified = false;
      existing.isbanned = false;
      existing.changeCredentialsTime = new Date();

      await existing.save();
      console.log("[register] Restored OK");
      return res.status(200).json({ message: "Registered successfully", user: existing });
    }

    console.log("[register] Creating user...");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      birthDate,
      city,
      idImagePath,
    });

    console.log("[register] User created OK:", user._id);
    return res.status(201).json({ message: "Registered successfully", user });
  } catch (err) {
    console.error("[register] UNHANDLED ERROR:", err.message, err.stack);
    return next(err);
  }
};


// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Invalid credentials", 401));

  if (user.isdeleted) return next(new AppError("Invalid credentials", 401));
  if (user.isbanned) return next(new AppError("Account banned", 403));

  const isMatch = await compare({ key: password, hashed: user.password });
  if (!isMatch) return next(new AppError("Invalid credentials", 401));

  // Identity verification gate — admins may always sign in, regular users
  // must wait until the admin team approves their submitted ID document.
  if (!user.isVerified && user.role !== "admin") {
    return next(
      new AppError(
        "Your account is pending verification. We'll email you as soon as our team reviews your ID.",
        403,
      ),
    );
  }

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
  if (!user) return next(new AppError("Email not found", 404));

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

// ─── Verify OTP ─────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email not found", 404));

  if (!user.otp || !user.otpExpiry) {
    return next(new AppError("No OTP requested", 400));
  }

  if (new Date() > user.otpExpiry) {
    return next(new AppError("OTP expired", 400));
  }

  const isOtpValid = await compare({ key: otp, hashed: user.otp });
  if (!isOtpValid) return next(new AppError("Invalid OTP", 400));

  return res.status(200).json({ message: "OTP verified" });
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email not found", 404));

  if (!user.otp || !user.otpExpiry) {
    return next(new AppError("No OTP requested", 400));
  }

  if (new Date() > user.otpExpiry) {
    return next(new AppError("OTP expired", 400));
  }

  const isOtpValid = await compare({ key: otp, hashed: user.otp });
  if (!isOtpValid) return next(new AppError("Invalid OTP", 400));

  user.password = await Hash({ key: password });
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.changeCredentialsTime = new Date();
  await user.save();

  return res.status(200).json({ message: "Password reset successfully" });
};
