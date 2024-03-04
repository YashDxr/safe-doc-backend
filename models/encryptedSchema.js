import mongoose from "mongoose";

const encryptedDocumentSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true,
  },
});

const EncryptedDocument = mongoose.model(
  "EncryptedDocument",
  encryptedDocumentSchema
);

export default EncryptedDocument;
