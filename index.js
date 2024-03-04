import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { useDatabase } from "./services/hooks.js";
import registerRouter from "./routes/registerRoute.js";
import loginRouter from "./routes/loginRoute.js";
import uploadRouter from "./routes/uploadRoute.js";

dotenv.config();
const app = express();

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
app.use(express.json());
app.use(cors());

useDatabase(process.env.MONGO_URL);

app.use("/auth", registerRouter);
app.use("/auth", loginRouter);
app.use("/upl", uploadRouter);
