import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    claimUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimType: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
    },
    documentPath: {
      type: String,
      required: true, // الملف إلزامي عشان الـ OCR يشتغل
    },
    // --- حقول التحقق الجديدة ---
    status: {
      type: String,
      enum: ["pending_ocr", "pending_review", "approved", "rejected"],
      default: "pending_ocr",
    },
    ocrResult: {
      // بنخزن هنا النص اللي الـ AI قراه من البطاقة للرجوع إليه
      type: String,
    },
    ocrMatched: {
      // هل الـ AI لقى تطابق في الأسماء ولا لأ؟
      type: Boolean,
      default: false,
    },
    // -------------------------
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // الأدمن اللي وافق على الطلب نهائياً
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
