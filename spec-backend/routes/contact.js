const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,        // your email
      pass: process.env.CONTACT_EMAIL_PASS,   // app password
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,            // shows user's email in the message
    to: ["sreethan8809@gmail.com", "amulsree@gmail.com"], // your team
    subject: `New Contact Form Submission from ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

module.exports = router;