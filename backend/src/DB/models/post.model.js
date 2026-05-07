import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postType: { type: String, enum: ["missing", "found"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    nameSearchKey: { type: String, index: true },
    age: { type: Number },
    ageUnit: { type: String, enum: ["years", "months", "days"], default: "years" },
    gender: { type: String, enum: ["male", "female", "unknown"] },
    hairColour: { type: String },
    eyeColour: { type: String },
    clothesDescription: { type: String },
    city: { type: String },
    lastSeenLocation: { type: String },
    lastSeenDate: { type: Date },
    foundLocation: { type: String },
    affiliation: {
      type: String,
      enum: ["none", "shelter", "hospital", "nonprofit", "government"],
    },
    organizationName: { type: String },
    reporterPhone: { type: String },
    postImages: [{ type: String }],
    faceEncoding: { type: [Number], default: [] },
    status: { type: String, enum: ["active", "resolved", "closed"], default: "active" },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "MapData" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
