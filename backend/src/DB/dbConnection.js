import mongoose from "mongoose";

const connectionDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error(`MongoDB connection error: ${err.message}`));
};

export default connectionDB;
