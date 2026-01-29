const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

// Initialize Resend with your API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Health check route (keep as-is)
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Contact API is healthy!" });
});

// Contact form submission
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Send email using Resend
    await resend.emails.send({
      from: "Special Needs App <onboarding@resend.dev>", // replace Nodemailer 'from'
      to: ["sreethan8809@gmail.com", "amulsree@gmail.com"], // recipients
      reply_to: email, // user email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

module.exports = router;