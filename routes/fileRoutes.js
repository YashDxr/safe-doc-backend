// routes/fileRoutes.js
import express from "express";
import {
  decryptFile,
  downloadDecryptFile,
  encryptFile,
  getFiles,
  getKey,
} from "../controllers/file-controller.js";

const router = express.Router();

router.post("/encrypt", encryptFile);
router.post("/decrypt", decryptFile);
router.post("/decrypt/:username/:name", downloadDecryptFile);
router.get("/getFiles/:username", getFiles);
router.post("/getKey", getKey);

export default router;
