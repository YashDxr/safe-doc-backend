import Credential from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const saltRounds = 10;
  const { username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  const newUser = new Credential({
    username,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    res.status(200).json("User created successfully");
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user =
      (await Credential.findOne({ email })) ||
      (await Credential.findOne({ username: email }));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  const user = await Credential.findOne({ email: req.body.email });
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(user);
  } else {
    const createUsername =
      req.body.name.split(" ").join("").toLowerCase() +
      Math.random().toString(10).slice(-4);
    const createPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hashSync(createPassword, 10);
    const newUser = new Credential({
      username: createUsername,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);
    res
      .cookie("acccess_token", token, { httpOnly: true })
      .status(200)
      .json(newUser);
  }
};

// export const githubAuth = async (req, res) => {
//   const user = await Credential.findOne({ email: req.body.email });
//   if (user) {
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
//     res
//       .cookie("access_token", token, { httpOnly: true })
//       .status(200)
//       .json(user);
//   } else {
//     const createUsername =
//       req.body.name.split(" ").join("").toLowerCase() +
//       Math.random().toString(10).slice(-4);
//     const createPassword =
//       Math.random().toString(36).slice(-8) +
//       Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hashSync(createPassword, 10);
//     const newUser = new Credential({
//       username: createUsername,
//       email: req.body.email,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY);
//     res
//       .cookie("acccess_token", token, { httpOnly: true })
//       .status(200)
//       .json(newUser);
//   }
// };

export const logout = (req, res) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("Logged out successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
