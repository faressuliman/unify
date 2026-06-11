// Main entry point for the Unify backend server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import bootstrap from "./src/app.controller.js";
import { initSocket } from "./src/realtime/io.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.MODE === "DEV" || process.env.NODE_ENV !== "production") {
        const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
        if (isLocalhost) return callback(null, true);
      }
      const allowed = process.env.FRONTEND_URL || "http://localhost:5173";
      if (Array.isArray(allowed) ? allowed.includes(origin) : origin === allowed) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

const port = process.env.PORT || 3000;

const start = async () => {
  await bootstrap(app, express);

  const httpServer = createServer(app);
  initSocket(httpServer);
  httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();