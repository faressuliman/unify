import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import bootstrap from "./src/app.controller.js";

dotenv.config({ path: path.resolve(".env") });

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const port = process.env.PORT || 3001;

const start = async () => {
  await bootstrap(app, express);

  const httpServer = createServer(app);
  httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();
