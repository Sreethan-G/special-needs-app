const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  lat: Number,
  lng: Number,
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicUrl: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
  resetCode: String,
  resetCodeExpires: Date,
  location: { type: locationSchema, default: () => ({}) },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
