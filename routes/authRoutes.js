import express from "express";
import { googleAuth, login, signup } from "../controllers/auth-controller.js";

const router = express.Router();

//Routes

router.post("/login", login);
router.post("/signup", signup);
router.post("/google", googleAuth);

export default router;
