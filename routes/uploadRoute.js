import express from "express";
import { encryptFileFromFirebase } from "../controllers/upload.js";

const router = express.Router();

router.post("/upload", encryptFileFromFirebase);

export default router;
