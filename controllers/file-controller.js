import crypto from "crypto";
import fs from "fs/promises";
import Document from "../models/documentSchema.js";

const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;

export const encryptFile = async (req, res) => {
  try {
    const { name, aesKey } = req.body;
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

    // Save the encrypted file to MongoDB
    await Document.create({
      filename: name,
      pdfFiles: {
        data: encryptedData,
        contentType: file.mimetype,
        iv: iv.toString("hex"),
      },
    }).then(console.log("Saved Document"));

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
    const { name, aesKey } = req.body;
    console.log(req.body);
    // Retrieve the encrypted document from MongoDB based on filename
    const document = await Document.findOne({ filename: name });
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    console.log(document);
    const pdfFile = document.pdfFiles[0];
    const encryptedData = pdfFile.data;
    const contentType = pdfFile.contentType;
    const ivHex = pdfFile.iv;

    const aesKeyArray = Uint8Array.from(atob(aesKey), (c) => c.charCodeAt(0));
    console.log("Key size: ", aesKeyArray.length);
    const iv = Buffer.from(ivHex, "hex");

    // Create a decipher using the AES algorithm and AES key
    const decipher = crypto.createDecipheriv(algorithm, aesKeyArray, iv);

    // Decrypt the encrypted data
    let decryptedData = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    // Set the response headers and send the decrypted data as response
    res.setHeader("Content-Type", contentType);
    res.send(decryptedData);
  } catch (error) {
    console.error("Error decrypting and retrieving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFile = async (req, res) => {
  const filename = req.params.filename;
  try {
    const document = await Document.findOne({ filename: filename });
    if (!document || !document.pdfFiles || document.pdfFiles.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    // Assuming you want the first PDF file in the array
    const pdfFile = document.pdfFiles[0];

    if (!pdfFile.data || !pdfFile.contentType) {
      return res.status(404).json({ error: "File data not found" });
    }

    // Set the Content-Type header
    res.setHeader("Content-Type", pdfFile.contentType);

    // Send the binary data as response
    res.send(pdfFile.data.buffer); // Assuming data is a Buffer, adjust accordingly
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
