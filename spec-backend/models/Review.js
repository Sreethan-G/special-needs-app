const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  resourceId: { type: String, required: true}
});

module.exports = mongoose.model("Review", reviewSchema);