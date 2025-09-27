const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  address: { type: String, default: "" },
  city:    { type: String, default: "" },
  state:   { type: String, default: "" },
  lat:     { type: Number, default: null },
  lng:     { type: Number, default: null },
});

const resourceSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  location: { type: locationSchema, default: () => ({}) }, // nested object with lat/lng
  contact:  { type: String, default: "" },
  languages:{ type: String, default: "" },
  website:  { type: String, default: "" },
  notes:    { type: String, default: "" },
  image:    { type: String, default: "" },
  type:     { type: String, default: "" },
});

module.exports = mongoose.model("Resource", resourceSchema);
