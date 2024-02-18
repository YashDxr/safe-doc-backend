import Credential from "../models/credentialSchema.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Credential.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
