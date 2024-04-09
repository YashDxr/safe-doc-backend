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
      return res.status(404).json("User not found!");
    }
    const verifyPassword = bcrypt.compareSync(password, user.password);
    if (!verifyPassword) {
      console.log("Wrong password");
      return res.status(402).json("Invalid Password");
    }

    return res.status(200).json(user.email);
  } catch (error) {
    console.log("Server Error", error);
  }
};

export const generateOTP = async (req, res) => {
  const userEmail = req.params.email;
  const checkOtp = await OTP.find({ email: userEmail });
  if (checkOtp.length > 0) {
    await OTP.deleteMany({ email: userEmail });
  }
  const otp = generate(6, { upperCaseAlphabets: false, specialChars: false });

  try {
    const info = await transporter.sendMail({
      from: "yashsingh05102002@outlook.com",
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

    console.log("Mailid: ", info.messageId);
    const hashedOTP = bcrypt.hashSync(otp, 10);
    const newOtp = new OTP({
      email: userEmail,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });
    await newOtp.save();
    console.log(userEmail);
    return res.status(200).json("OTP sent successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Server Error");
  }
};

const transporter = createTransport({
  service: "Outlook365",
  host: "smtp.office365.com",
  port: "465",
  secure: true,
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  auth: {
    user: "yashsingh05102002@outlook.com",
    pass: "705224outlook",
  },
});

export const verifyOtp = async (req, res) => {
  const { username, otp } = req.body;

  try {
    const user = await Credential.findOne({ username: username });
    // console.log("User: ",user);
    if (!user) {
      return res.status(404).json("User not found!");
    }
    const emailid = user.email;
    const data = await OTP.findOne({ email: emailid });
    if (!data) {
      return res.status(404).json("Otp not found");
    }
    if (data.expiresAt < Date.now()) {
      return res.status(401).json({ again: true });
    }

    const verification = bcrypt.compareSync(otp, data.otp);
    if (!verification) {
      return res.status(402).json("Invalid Otp");
    }
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json("Server error", error);
  }
};
