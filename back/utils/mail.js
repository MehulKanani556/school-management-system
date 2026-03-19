const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a welcome email to a new user.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email.
 * @param {string} options.subject - Email subject.
 * @param {string} options.title - Header title.
 * @param {string} options.subtitle - Header subtitle.
 * @param {string} options.firstName - User's first name.
 * @param {string} options.lastName - User's last name.
 * @param {string} options.idLabel - Label for the ID field (e.g., "Employee ID", "Admin ID").
 * @param {string} options.idValue - Value for the ID field.
 * @param {string} options.email - User's email (for the body).
 * @param {string} options.password - Plain text password.
 * @param {Date|string} options.joiningDate - Date of joining.
 * @param {string} options.footerNote - Note at the bottom.
 */
exports.sendWelcomeMail = async (options) => {
  const { 
    to, subject, title, subtitle, firstName, lastName, 
    idLabel, idValue, email, password, joiningDate, footerNote 
  } = options;

  const formattedDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Not specified';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:2px;">${title}</h1>
        <p style="margin:8px 0 0;color:#bfdbfe;font-size:13px;">${subtitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;">Hello, <strong>${firstName} ${lastName}</strong> 👋</p>
        <p style="color:#94a3b8;">Your account has been created. Here are your login credentials:</p>
        <div style="background:#1e293b;border-radius:12px;padding:20px;margin:24px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">${idLabel}</td><td style="padding:8px 0;font-weight:bold;">${idValue}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;font-weight:bold;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Password</td><td style="padding:8px 0;font-weight:bold;color:#60a5fa;">${password}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Joining Date</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
          </table>
        </div>
        <p style="color:#f59e0b;font-size:13px;">⚠️ Please change your password after first login.</p>
        <p style="color:#64748b;font-size:12px;margin-top:32px;">${footerNote}</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${title}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
