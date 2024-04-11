import Credential from "../models/userSchema.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  const saltRounds = 10;
  const { username, email, password } = req.body;

  try {
    const usernameCheck = await Credential.findOne({ username });
    const emailCheck = await Credential.findOne({ email });
    if (usernameCheck && emailCheck) {
      return res
        .status(401)
        .json({ error: "Username and Email already exist!" });
    }
    if (usernameCheck) {
      return res.status(401).json({ error: "Username already exist!" });
    }
    if (emailCheck) {
      return res.status(401).json({ error: "Email already exist!" });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = new Credential({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const user =
      (await Credential.findOne({ email: id })) ||
      (await Credential.findOne({ username: id }));

    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  const user = await Credential.findOne({ email: req.body.email });
  if (user) {
    res.status(200).json(user);
  } else {
    const createUsername =
      req.body.name.split(" ").join("").toLowerCase() +
      Math.random().toString(10).slice(-4);
    const createPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(createPassword, 10);
    const newUser = new Credential({
      username: createUsername,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(200).json(newUser);
  }
};
