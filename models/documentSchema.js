import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  pdfFiles: {
    type: [
      {
        data: Buffer,
        contentType: String,
        iv: String,
      },
    ],
  },
});

const Document = mongoose.model("Document", DocumentSchema);

export default Document;
