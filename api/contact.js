// api/contact.js  — Vercel Serverless Function
// Uses Nodemailer with Gmail SMTP (or any SMTP provider)
// Set these env vars in Vercel dashboard:
//   SMTP_HOST        e.g. smtp.gmail.com
//   SMTP_PORT        e.g. 587
//   SMTP_USER        your Gmail address  e.g. juzarkagdi53@gmail.com
//   SMTP_PASS        Gmail App Password  (NOT your normal password)
//   MAIL_TO          recipient email     e.g. juzarkagdi53@gmail.com

const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // ── CORS headers ────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Validate body ────────────────────────────────────────────────────────────
  const { name, phone, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // ── Create transporter ───────────────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ── Email to YOU (portfolio owner) ──────────────────────────────────────────
  const ownerMail = {
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO || process.env.SMTP_USER,
    replyTo: email,
    subject: `📬 Portfolio Inquiry — ${subject || "New message"} — from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#050d1a;padding:28px 32px;border-radius:6px 6px 0 0;">
          <h2 style="color:#4f9eff;margin:0;font-size:1.2rem;letter-spacing:-.3px;">
            New Portfolio Inquiry
          </h2>
        </div>
        <div style="background:#f8faff;padding:28px 32px;border:1px solid #e0e8f8;border-top:none;border-radius:0 0 6px 6px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#2d4a7a;width:110px;font-size:.88rem;">Name</td>
              <td style="padding:8px 0;color:#0a1628;font-size:.88rem;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#2d4a7a;font-size:.88rem;">Email</td>
              <td style="padding:8px 0;font-size:.88rem;"><a href="mailto:${escapeHtml(email)}" style="color:#1a6adb;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#2d4a7a;font-size:.88rem;">Phone</td>
              <td style="padding:8px 0;color:#0a1628;font-size:.88rem;">${escapeHtml(phone || "—")}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#2d4a7a;font-size:.88rem;">Subject</td>
              <td style="padding:8px 0;color:#0a1628;font-size:.88rem;">${escapeHtml(subject || "—")}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #dde6f7;margin:18px 0;"/>
          <div style="font-weight:700;color:#2d4a7a;font-size:.88rem;margin-bottom:10px;">Message</div>
          <div style="background:#fff;border:1px solid #dde6f7;border-radius:4px;padding:16px 18px;color:#0a1628;font-size:.9rem;line-height:1.75;white-space:pre-wrap;">${escapeHtml(message)}</div>
          <div style="margin-top:24px;padding:14px 18px;background:#eef4ff;border-radius:4px;font-size:.8rem;color:#5a7aaa;">
            Reply directly to this email to respond to ${escapeHtml(name)} at ${escapeHtml(email)}
          </div>
        </div>
      </div>
    `,
  };

  // ── Auto-reply to sender ─────────────────────────────────────────────────────
  const autoReply = {
    from: `"Juzar Kagdi" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name.split(" ")[0]}! — Juzar Kagdi`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#050d1a;padding:28px 32px;border-radius:6px 6px 0 0;">
          <h2 style="color:#4f9eff;margin:0;font-size:1.1rem;">juzar.kagdi()</h2>
        </div>
        <div style="background:#f8faff;padding:28px 32px;border:1px solid #e0e8f8;border-top:none;border-radius:0 0 6px 6px;">
          <p style="color:#0a1628;font-size:.95rem;line-height:1.8;margin:0 0 16px;">
            Hi <strong>${escapeHtml(name.split(" ")[0])}</strong>,
          </p>
          <p style="color:#2d4a7a;font-size:.9rem;line-height:1.8;margin:0 0 16px;">
            Thanks for getting in touch! I've received your message and will get back to you within <strong>24 hours</strong>.
          </p>
          <p style="color:#2d4a7a;font-size:.9rem;line-height:1.8;margin:0 0 24px;">
            In the meantime, feel free to check out my work or connect with me:
          </p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="https://github.com" style="color:#1a6adb;font-size:.85rem;text-decoration:none;padding:8px 16px;border:1px solid #b8d0f5;border-radius:4px;">GitHub</a>
            <a href="https://linkedin.com" style="color:#1a6adb;font-size:.85rem;text-decoration:none;padding:8px 16px;border:1px solid #b8d0f5;border-radius:4px;">LinkedIn</a>
          </div>
          <hr style="border:none;border-top:1px solid #dde6f7;margin:24px 0;"/>
          <p style="color:#8a9bb5;font-size:.78rem;margin:0;">
            Juzar Kagdi · Full Stack Developer · Bharuch, Gujarat<br/>
            +91 79849 15566 · juzarkagdi53@gmail.com
          </p>
        </div>
      </div>
    `,
  };

  // ── Send both emails ─────────────────────────────────────────────────────────
  try {
    await transporter.sendMail(ownerMail);
    await transporter.sendMail(autoReply);
    return res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Mail error:", error);
    return res.status(500).json({ error: "Failed to send email. Please try again." });
  }
};

// ── Utility ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}