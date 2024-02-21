import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { useDatabase } from "./hooks/hooks.js";
import authRouter from "./routes/authRoutes.js"

dotenv.config();
const app = express();

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
app.use(express.json());
app.use(cors());

useDatabase(process.env.MONGO_URL);

app.use("/auth", authRouter);
