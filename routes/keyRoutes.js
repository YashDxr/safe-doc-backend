// routes/fileRoutes.js
import express from "express";
import { storeKey, getKey, getStore } from "../controllers/key-controller.js";

const router = express.Router();

router.post("/save", storeKey);
router.post("/getKey", getKey);
router.get("/getFiles/:user", getStore);

export default router;
