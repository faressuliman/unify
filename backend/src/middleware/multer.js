import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary/index.js";
import fs from "fs";
import path from "path";

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
  return upload;
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
