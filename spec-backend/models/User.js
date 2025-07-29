const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed, not plain text!
  profilePicUrl: { type: String }, // Optional profile picture URL
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
