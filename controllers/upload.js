import axios from "axios"; // Assuming you're using Axios for HTTP requests
import CryptoJS from "crypto-js";
import EncryptedDocument from "../models/encryptedSchema.js";

// "https://firebasestorage.googleapis.com/v0/b/oauthsafe.appspot.com/o/documents%2Fdd8e6ac9-17a1-4818-bebb-e8c915a30d4c?alt=media&token=bcdd6c70-b6d6-4c13-a59a-b42f4b43853f"
// Function to download and encrypt file from Firebase Storage
export const encryptFileFromFirebase = async (req, res) => {
  const { fileUrl } = req.body;

  try {
    const { data } = await axios.get(fileUrl);

    const encryptedFile = CryptoJS.AES.encrypt(
      data,
      process.env.ENCRYPTION_KEY
    ).toString();

    // Save the encrypted file or its contents to your storage or database
    // For example, if using MongoDB with Mongoose:
    const encryptedDocument = new EncryptedDocument({ data: encryptedFile });
    await encryptedDocument.save();
    console.log(fileUrl);
    res
      .status(200)
      .json({ message: "File downloaded, encrypted, and saved successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
