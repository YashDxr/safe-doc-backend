import express from "express";
import { encryptFile } from "../controllers/file-controller.js";

const router = express.Router();

router.post("/encrypt", encryptFile);

export default router;
