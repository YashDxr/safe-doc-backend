import crypto from "crypto";
import fs from "fs/promises";
import UserDoc from "../models/documentSchema.js";
import KeyStore from "../models/keySchema.js";
import CryptoJS from "crypto-js";

const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;

export const encryptFile = async (req, res) => {
  try {
    const { username, filename, aesKey } = req.body;
    const file = req.file;
    console.log("File: ", file);
    const aesKeyArray = Uint8Array.from(atob(aesKey), (c) => c.charCodeAt(0));
    console.log("Key size: ", aesKeyArray.length);

    //File reading
    const fileData = await fs.readFile(file.path);
    console.log("File data:", fileData);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create a cipher using the AES algorithm
    const cipher = crypto.createCipheriv(algorithm, aesKeyArray, iv);

    let encryptedData = Buffer.concat([
      cipher.update(fileData), // Encrypt the file buffer
      cipher.final(),
    ]);

    let user = await UserDoc.findOne({ username });

    if (!user) {
      user = new UserDoc({ username });
    }

    // Find existing file with the same filename (if any) and update or add a new file entry
    const existingFileIndex = user.files.findIndex(
      (file) => file.filename === filename
    );

    if (existingFileIndex !== -1) {
      // Update existing file data
      user.files[existingFileIndex] = {
        filename,
        data: encryptedData,
        contentType: file.mimetype,
        iv: iv.toString("hex"),
      };
    } else {
      // Add new file entry
      user.files.push({
        filename,
        data: encryptedData,
        contentType: file.mimetype,
        iv: iv.toString("hex"),
      });
    }

    await user.save();
    console.log(`Encrypted file '${filename}' saved for user '${username}'`);

    // Set response headers and send the encrypted data as response
    res.setHeader("Content-Type", file.mimetype);
    res.send(encryptedData);

    if (file?.path) {
      try {
        await fs.unlink(file.path); // Delete the temporary file
        console.log("Temporary file deleted successfully");
      } catch (err) {
        console.error("Error deleting temporary file:", err);
        // Handle the error (e.g., log, ignore, or propagate)
      }
    }
  } catch (error) {
    console.error("Error encrypting and saving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const decryptFile = async (req, res) => {
  try {
    const { username, name, aesKey } = req.body;

    // Find the user document by username
    const userDoc = await UserDoc.findOne({ username });

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the file entry with the specified filename
    const fileEntry = userDoc.files.find((file) => file.filename === name);

    if (!fileEntry) {
      return res.status(404).json({ error: "File not found for the user" });
    }

    const encryptedData = fileEntry.data;
    const PDFcontentType = fileEntry.contentType;
    const ivHex = fileEntry.iv;

    const aesKeyArray = Uint8Array.from(atob(aesKey), (c) => c.charCodeAt(0));

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, aesKeyArray, iv);

    let decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    res.setHeader("Content-Type", PDFcontentType);
    res.send(decryptedData);
  } catch (error) {
    console.error("Error decrypting and retrieving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFiles = async (req, res) => {
  const username = req.params.username;

  try {
    const user = await UserDoc.findOne({ username });
    // console.log("User: ", user);
    res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json("Server Error");
  }
};

export const getKey = async (req, res) => {
  const { username, filename } = req.body;
  console.log("User: ",username);
  console.log("File: ",filename);

  try {
    const keyStore = await KeyStore.findOne({ user: username });
    if (!keyStore) {
      return res.status(400).json("No keys found for this user");
    }

    const fileEntry = keyStore.files.find((file) => file.filename === filename);
    if (!fileEntry) {
      return res.status(401).json("No key found for this filename");
    }

    const decryptedKey = CryptoJS.AES.decrypt(
      fileEntry.key,
      process.env.KEY_PASSWORD
    ).toString(CryptoJS.enc.Utf8);

    res.status(200).json({ key: decryptedKey });
  } catch (err) {
    return res.status(500).json("Server Error");
  }
};
