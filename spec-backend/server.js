require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const resourceRoutes = require("./routes/resources");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

const app = express();

/* ✅ Ensure upload directory exists */
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedOrigins = [
  "https://special-needs-app.vercel.app",
  "https://special-needs-app-git-main.vercel.app",
  "http://localhost:3000",
  "http://localhost:19006",
];

/* ✅ Middleware */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile apps / Postman

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ✅ API routes */
app.use("/api/resources", resourceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

/* ✅ MongoDB */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ✅ Multer config */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ✅ Static uploads */
app.use("/uploads", express.static(uploadDir));

/* ✅ Upload endpoint */
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

/* ✅ Server start (MUST BE LAST) */
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
