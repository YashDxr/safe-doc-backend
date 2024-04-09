import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
});

const StoreSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  files: [FileSchema], // Array of subdocuments representing files
});

const KeyStore = mongoose.model("KeyStore", StoreSchema);

export default KeyStore;
