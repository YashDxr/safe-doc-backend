import Credential from "../models/credentialSchema.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  const saltRounds = 10;
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new Credential({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json("User created successfully");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
