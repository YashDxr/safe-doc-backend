import Credential from "../models/userSchema.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  const saltRounds = 10;
  const { username, email, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = new Credential({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json("User created successfully");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Credential.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res
      .status(200)
      .json({ message: "Login successful", username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
