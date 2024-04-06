// routes/fileRoutes.js
import express from "express";
import {
  decryptFile,
  encryptFile,
  getFile,
} from "../controllers/file-controller.js";

const router = express.Router();

router.post("/encrypt", encryptFile);
router.post("/decrypt", decryptFile);
router.get("/download/:filename", getFile);

export default router;
