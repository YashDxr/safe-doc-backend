import OTP from "../models/optSchema.js";
import Credential from "../models/userSchema.js";
import { generate } from "otp-generator";
import { createTransport } from "nodemailer";
import bcrypt from "bcrypt";

export const verifyUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Credential.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const verifyPassword = bcrypt.compareSync(password, user.password);
    if (!verifyPassword) {
      return res.status(402).json({ error: "Invalid Password" });
    }

    return res.status(200).json(user.email);
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const generateOTP = async (req, res) => {
  const userEmail = req.params.email;
  console.log(userEmail);
  const checkOtp = await OTP.find({ email: userEmail });
  console.log(checkOtp);
  if (checkOtp.length > 0) {
    await OTP.deleteMany({ email: userEmail });
  }
  const otp = generate(6, { upperCaseAlphabets: false, specialChars: false });
  console.log(otp);
  try {
    const info = await transporter.sendMail({
      from: "no-reply-safedoc@outlook.com",
      to: userEmail,
      subject: "Verification Mail For Safe-Doc ✔",
      html: `<!DOCTYPE html>
      <html lang="en">
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      
      <body style="font-family: Arial, sans-serif; padding: 20px;">
      
        <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verification Email</h2>
      
          <p style="font-size: 16px; color: #666; text-align: center;">
            Hello,<br>
            Here is your One-Time Password (OTP) for Safe-Doc verification:
          </p>
      
          <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-top: 20px;">
            <h3 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 15px;">Your OTP:</h3>
            <p style="font-size: 32px; color: #007bff; text-align: center; margin: 0; font-weight: bold;">${otp}</p>
          </div>
      
          <p style="font-size: 16px; color: #666; text-align: center; margin-top: 20px;">
            Use the above OTP to verify your Safe-Doc account. This OTP is valid for a limited time only.
          </p>
      
          <p style="font-size: 16px; color: #666; text-align: center; margin-top: 20px;">
            If you did not request this verification, please ignore this email.
          </p>
        </div>
      
      </body>
      
      </html>`,
    });
    console.log(info.messageId);
    const hashedOTP = bcrypt.hashSync(otp, 10);
    console.log(hashedOTP);
    const newOtp = new OTP({
      email: userEmail,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });
    await newOtp.save();
    console.log("End");
    return res.status(200).json("OTP sent successfully");
  } catch (err) {
    return res.status(500).json({ error: "Server Error" });
  }
};

const transporter = createTransport({
  service: "Outlook365",
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  auth: {
    user: "email",
    pass: "password",
  },
});

export const verifyOtp = async (req, res) => {
  const { username, otp } = req.body;

  try {
    const user = await Credential.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const emailid = user.email;
    const data = await OTP.findOne({ email: emailid });
    if (!data) {
      return res.status(404).json({ error: "Otp not found. Try again!" });
    }
    if (data.expiresAt < Date.now()) {
      return res.status(401).json({ again: true });
    }

    const verification = bcrypt.compareSync(otp, data.otp);
    if (!verification) {
      return res.status(402).json({ error: "Invalid Otp" });
    }
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
