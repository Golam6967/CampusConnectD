/**
 * Gmail Notification Configuration
 * Handles Gmail SMTP setup using App Passwords
 */

const nodemailer = require("nodemailer");

// Get configuration from environment variables
const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

// Create a reusable transporter for sending emails via Gmail SMTP
const createGmailTransporter = () => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn(
      "⚠️ Gmail credentials not configured. Email notifications will not be sent.",
    );
    console.warn(
      "Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createGmailTransporter();

/**
 * Verifies Gmail connection
 * @returns {Promise<boolean>} - True if connection successful
 */
async function verifyGmailConnection() {
  try {
    await transporter.verify();
    console.log("✓ Gmail SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("✗ Failed to verify Gmail SMTP connection:", error.message);
    return false;
  }
}

module.exports = {
  transporter,
  verifyGmailConnection,
  GMAIL_USER,
};
