import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary/index.js";
import fs from "fs";
import path from "path";

// ── Startup check: surface missing Cloudinary credentials immediately in logs ──
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error(
    "[Cloudinary] MISSING CREDENTIALS — CLOUD_NAME:", CLOUD_NAME,
    "| API_KEY:", API_KEY ? "set" : "MISSING",
    "| API_SECRET:", API_SECRET ? "set" : "MISSING"
  );
} else {
  console.log("[Cloudinary] Credentials loaded. Cloud:", CLOUD_NAME);
}

export const filetypes = {
  image: ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/ico"],
  video: ["video/mp4", "video/quicktime", "video/mpeg"],
  audio: ["audio/mpeg", "audio/wav", "audio/aac"],
  document: ["application/pdf"],
};

export const multerHost = (customeValidation = [], folder = "mozmen") => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: customeValidation.map((type) => type.split("/")[1]),
      resource_type: "auto",
    },
  });

  function fileFilter(req, file, cb) {
    if (customeValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  }

  const upload = multer({ storage, fileFilter });

  // Return a wrapper that catches multer/Cloudinary errors and forwards them
  // to Express's error handler with a proper status code
  return {
    single: (fieldName) => (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          console.error("[multerHost] Upload error:", err.message, err);
          err.statusCode = err.statusCode || err.status || 500;
          return next(err);
        }
        next();
      });
    },
    array: (fieldName, maxCount) => (req, res, next) => {
      upload.array(fieldName, maxCount)(req, res, (err) => {
        if (err) {
          console.error("[multerHost] Upload error:", err.message, err);
          err.statusCode = err.statusCode || err.status || 500;
          return next(err);
        }
        next();
      });
    },
    fields: (fields) => (req, res, next) => {
      upload.fields(fields)(req, res, (err) => {
        if (err) {
          console.error("[multerHost] Upload error:", err.message, err);
          err.statusCode = err.statusCode || err.status || 500;
          return next(err);
        }
        next();
      });
    },
  };
};

export const multerDisk = (subfolder = "uploads") => {
  const dest = path.join(process.cwd(), subfolder);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });

  return multer({ storage });
};

export const multerMemory = (customeValidation = []) => {
  const storage = multer.memoryStorage();

  function fileFilter(req, file, cb) {
    if (customeValidation.length === 0 || customeValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  }

  return multer({ storage, fileFilter });
};
