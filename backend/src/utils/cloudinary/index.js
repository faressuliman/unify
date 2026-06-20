import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { v2 as cloudinary } from "cloudinary";

console.log("[Cloudinary] Config →", {
  cloud_name: process.env.CLOUD_NAME || "MISSING",
  api_key: process.env.API_KEY ? "set" : "MISSING",
  api_secret: process.env.API_SECRET ? "set" : "MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
