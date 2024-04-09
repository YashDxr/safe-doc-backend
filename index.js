import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { useDatabase } from "./hooks/hooks.js";
import authRouter from "./routes/authRoutes.js";
import fileRouter from "./routes/fileRoutes.js";
import otpRouter from "./routes/otpRoutes.js"
import keyRouter from "./routes/keyRoutes.js"

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

useDatabase(process.env.MONGO_URL);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/auth", authRouter);
app.use("/files", upload.single("file"), fileRouter);
app.use("/private", otpRouter);
app.use("/store", keyRouter);

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
