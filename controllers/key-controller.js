import KeyStore from "../models/keySchema.js";
import CryptoJS from "crypto-js";
import Credential from "../models/userSchema.js";
import bcrypt from "bcrypt";

export const storeKey = async (req, res) => {
  const { username, filename, aesKey } = req.body;
  const encryptedKey = CryptoJS.AES.encrypt(
    aesKey,
    process.env.KEY_PASSWORD
  ).toString();
  try {
    let UserStore = await KeyStore.findOne({ user: username });

    if (!UserStore) {
      // Create a new KeyStore document for the user
      UserStore = new KeyStore({
        user: username,
        files: [], // Initialize files array
      });
    }
    // Add the new file entry to the files array
    const existingFileIndex = UserStore.files.findIndex(
      (file) => file.filename === filename
    );

    if (existingFileIndex !== -1) {
      // Update the existing file entry with the new encrypted key
      UserStore.files[existingFileIndex].key = encryptedKey;
    } else {
      // Add a new file entry to the files array
      UserStore.files.push({
        filename,
        key: encryptedKey,
      });
    }
    // Save the updated KeyStore document
    await UserStore.save();

    res.status(200).json("Successfully saved key");
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

export const getKey = async (req, res) => {
  const { username, filename } = req.body;

  try {
    const user = await Credential.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "No user found" });
    }

    // const verifyPassword = bcrypt.compareSync(password, user.password);
    // if (!verifyPassword) {
    //   return res.status(401).json({ error: "Invalid credentials" });
    // }

    const keyStore = await KeyStore.findOne({ user: username });
    if (!keyStore) {
      return res.status(400).json({ error: "No keys found for this user" });
    }

    const fileEntry = keyStore.files.find((file) => file.filename === filename);
    if (!fileEntry) {
      return res.status(400).json({ error: "No key found for this filename" });
    }

    const decryptedKey = CryptoJS.AES.decrypt(
      fileEntry.key,
      process.env.KEY_PASSWORD
    ).toString(CryptoJS.enc.Utf8);

    res.status(200).json({ key: decryptedKey });
  } catch (error) {
    console.error("Error fetching key:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getStore = async (req, res) => {
  const { user } = req.params;

  try {
    // Find the KeyStore document for the specified user
    const keyStore = await KeyStore.findOne({ user });

    if (!keyStore) {
      return res
        .status(404)
        .json({ error: "User not found or no keys stored for this user" });
    }

    // Extract all filenames from the files array in the KeyStore document
    const filenames = keyStore.files.map((file) => file.filename);

    // Send the array of filenames as the response
    res.status(200).json({ filenames });
  } catch (error) {
    console.error("Error fetching filenames:", error);
    res.status(500).json({ error: "Server error" });
  }
};
