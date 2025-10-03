const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

router.post("/", async (req, res) => {
  try {
    const { userId, rating, review, resourceId } = req.body;

    const newReview = new Review({
      userId,
      rating,
      review,
      resourceId,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: "Error submitting review" });
  }
});


router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/:resourceId", async (req, res) => {
  try {
    const reviews = await Review.find({ resourceId: req.params.resourceId })
      .sort({ date: -1 })
      .populate("userId", "username profilePicUrl");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


module.exports = router;
