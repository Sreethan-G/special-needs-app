const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Resource = require("../models/Resource");

// ------------------- SYNC PASSWORD -------------------
router.patch("/sync-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res.status(400).json({ error: "Email and new password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "MongoDB password updated successfully" });
  } catch (error) {
    console.error("Sync password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- REGISTER -------------------
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

// ------------------- LOGIN -------------------
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
      secure: false,
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

// ------------------- GET CURRENT USER -------------------
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

// ------------------- GET USER BY ID -------------------
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

// ------------------- UPDATE USER -------------------
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, profilePicUrl, location } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicUrl) user.profilePicUrl = profilePicUrl;
    if (password) user.password = await bcrypt.hash(password, 10);

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

// ------------------- FAVORITES -------------------
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

// ------------------- VERIFY PASSWORD -------------------
router.post("/verify-password", async (req, res) => {
  const { userId, password } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  res.json({ success: match });
});

// ------------------- CHECK EMAIL --------------------
// ------------------- CHECK EMAIL EXISTS -------------------
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
