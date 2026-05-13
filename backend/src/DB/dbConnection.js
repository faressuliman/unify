import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectionDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => logger.info("MongoDB connected successfully"))
    .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));
};

export default connectionDB;
