import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    title: { type: String },
    lastSeen: { type: Date },
    name: { type: String },
    age: { type: Number },
    height: { type: Number },
    clothesDescription: { type: String },
    imagePath: { type: String },
    verificationDocument: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Poster = mongoose.model("Poster", posterSchema);
export default Poster;
