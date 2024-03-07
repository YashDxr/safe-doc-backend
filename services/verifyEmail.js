import NodeMailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const verification = async (email, subject, text) => {
  try {
    const transporter = NodeMailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: process.env.PORT,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email Sent Successfully");
  } catch (error) {
    console.log(error);
  }
};
