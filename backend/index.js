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
      // Allow any origin to connect by reflecting the origin back
      // This solves the CORS error on the deployed server when FRONTEND_URL isn't set perfectly
      callback(null, true);
    },
    credentials: true,
  }),
);

const port = process.env.PORT || 3000;

const start = async () => {
  await bootstrap(app, express);

  const httpServer = createServer(app);
  initSocket(httpServer);
  const isProduction = process.env.MODE === "PROD";
  if (isProduction) {
    httpServer.listen(port, "127.0.0.1", () => console.log(`Server listening on 127.0.0.1:${port}`));
  } else {
    httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
  }
};

start();