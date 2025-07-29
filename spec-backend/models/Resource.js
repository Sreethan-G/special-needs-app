const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: String,
  location: String,
  contact: String,
  languages: String,
  website: String,
  notes: String,
  image: String,
  type: String,
});

module.exports = mongoose.model("Resource", resourceSchema);
