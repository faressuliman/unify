// Main entry point for the Unify backend server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import bootstrap from "./src/app.controller.js";
import { initSocket } from "./src/realtime/io.js";

dotenv.config({ path: path.resolve(".env") });

const app = express();

// Allow preview/dev origins during development (helps vite preview at different port)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests like curl, or same-origin server-side calls
      if (!origin) return callback(null, true);
      // In development mode accept any localhost origin (ports vary)
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

const port = process.env.PORT || 3001;

const start = async () => {
  await bootstrap(app, express);

  const httpServer = createServer(app);
  initSocket(httpServer);
  httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();
