import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
});

const UserDocSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  files: [FileSchema],
});

const UserDoc = mongoose.model("UserDoc", UserDocSchema);

export default UserDoc;
