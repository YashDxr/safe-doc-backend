import Credential from "../models/credentialSchema.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new Credential({ username, email, password });

  try {
    await newUser.save();
    res.status(200).json("User created successfully");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
