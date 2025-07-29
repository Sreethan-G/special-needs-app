const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User"); // Adjust path if needed
const Resource = require("../models/Resource");

// Register new user
router.post("/register", async (req, res) => {
  const { email, username, password, profilePicUrl } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ field: "email", error: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ field: "password", error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userData = {
      _id: user._id,
      email: user.email,
      username: user.username,
      profilePicUrl: user.profilePicUrl,
    };

    res.json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // You could also query the DB if you want fresh user data
    res.json({ userId: decoded.id });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// PATCH /api/users/reset-password
// expects: { email, newPassword }
router.patch('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  console.log("Received reset request body:", req.body);

  console.log("Reset request received for:", email);

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("Password updated for:", email);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error); // <--- Key line
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user's favorite resource IDs
router.get("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID and populate favorites to get full resources if needed
    const user = await User.findById(userId).select("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return array of resource IDs (as strings)
    res.json(user.favorites.map((fav) => fav.toString()));
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;
    const { resourceId } = req.body;

    if (!resourceId) {
      return res.status(400).json({ message: "resourceId is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.favorites.findIndex(
      (favId) => favId.toString() === resourceId
    );

    let isFavNew;

    if (index === -1) {
      // Not in favorites, add it
      user.favorites.push(resourceId);
      isFavNew = true;
    } else {
      // Already favorited, remove it
      user.favorites.splice(index, 1);
      isFavNew = false;
    }

    await user.save();

    res.json({ success: true, isFav: isFavNew });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user info (email, username, password, profilePicUrl)
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, profilePicUrl } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicUrl) user.profilePicUrl = profilePicUrl;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;