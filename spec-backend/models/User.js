const mongoose = require("mongoose");

// Location subdocument schema
const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  state: String,
  lat: Number,
  lng: Number,
}, { _id: false }); // prevent nested _id

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicUrl: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
  resetCode: String, // for password reset
  resetCodeExpires: Date,
  location: { type: locationSchema, default: () => ({}) }, // ensures every user has location
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
