const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Resource = require("../models/Resource");

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  const { email, username, password, profilePicUrl } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      username,
      password: hashedPassword,
      profilePicUrl,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ field: "email", error: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ field: "password", error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- GET CURRENT USER -----------------
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userId: decoded.id });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ----------------- FORGOT PASSWORD -----------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.resetCode = "123456"; // for testing
    await user.save();
    console.log(`Reset code for ${email}: 123456`);

    res.json({ message: "Reset code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- RESET PASSWORD -----------------
router.patch("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: "Email, OTP, and new password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetCode || user.resetCode !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (Date.now() > user.resetCodeExpires) return res.status(400).json({ error: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- GET USER -----------------
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- UPDATE USER -----------------
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, profilePicUrl, location } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Dynamic field updates
    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicUrl) user.profilePicUrl = profilePicUrl;
    if (password) user.password = await bcrypt.hash(password, 10);

    // Merge location updates
    if (location) {
      user.location = { ...user.location.toObject(), ...location };
      user.markModified("location");
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- FAVORITES -----------------
router.get("/:userId/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("favorites");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.favorites.map(fav => fav.toString()));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;
    const { resourceId } = req.body;
    if (!resourceId) return res.status(400).json({ error: "resourceId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.favorites.findIndex(fav => fav.toString() === resourceId);
    let isFavNew;

    if (index === -1) {
      user.favorites.push(resourceId);
      isFavNew = true;
    } else {
      user.favorites.splice(index, 1);
      isFavNew = false;
    }

    await user.save();
    res.json({ success: true, isFav: isFavNew });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
