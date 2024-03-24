import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { useDatabase } from "./hooks/hooks.js";
import authRouter from "./routes/authRoutes.js";
import fileRouter from "./routes/fileRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

useDatabase(process.env.MONGO_URL);

app.use("/auth", authRouter);
app.use("/files", fileRouter);

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});