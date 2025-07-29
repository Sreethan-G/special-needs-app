require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const resourceRoutes = require("./routes/resources");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use resource routes
app.use("/api/resources", resourceRoutes);

// Add user routes under /api/users
app.use("/api/users", userRoutes);

// Add review routes
app.use("/api/reviews", reviewRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(3001, "0.0.0.0", () => {
  console.log("Server is running on port 3001");
});

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;

  res.json({ url: imageUrl });
});