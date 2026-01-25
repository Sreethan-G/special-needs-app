const isProd = process.env.NODE_ENV === "production";

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
const contactRoutes = require("./routes/contact");

const app = express();

/* ✅ Ensure upload directory exists */
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ✅ Middleware */
app.use(cors({
  origin: function (origin, callback) {
    // Allow mobile apps, Postman, curl
    if (!origin) return callback(null, true);

    // ✅ Production (Render)
    if (isProd) {
      if (
        origin === "https://special-needs-app.vercel.app" ||
        origin === "https://special-needs-app-git-main.vercel.app" ||
        origin.startsWith("https://special-needs-")
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }

    // ✅ Development (localhost, Expo, LAN)
    if (
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://10.0.")
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
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
app.use("/api/contact", contactRoutes);

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
