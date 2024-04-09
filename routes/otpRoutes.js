import express from "express";
import {
  generateOTP,
  verifyUser,
  verifyOtp,
} from "../controllers/otp-controller.js";

const router = express.Router();

router.post("/verify", verifyUser);
router.post("/verifyotp", verifyOtp);
router.get("/reqOtp/:email", generateOTP);


export default router;