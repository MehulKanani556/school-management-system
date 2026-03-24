const nodemailer = require('nodemailer');
const SystemSetting = require('../models/systemSetting.model');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Helper to check if email notifications are enabled
 */
const isEmailEnabled = async () => {
    try {
        const setting = await SystemSetting.findOne({ key: 'EMAIL_NOTIFICATIONS' });
        return setting ? setting.value === true || setting.value === 'true' : true;
    } catch (e) {
        return true; // Fail open
    }
};

/**
 * Send a welcome email to a new user.
 */
exports.sendWelcomeMail = async (options) => {
  if (!(await isEmailEnabled())) {
      console.log('Email notifications are disabled in system settings. Skipping welcome mail.');
      return;
  }

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

exports.sendFeeReminderMail = async (options) => {
  if (!(await isEmailEnabled())) {
      console.log('Email notifications are disabled in system settings. Skipping fee reminder.');
      return;
  }

  const { to, studentName, amount, dueDate, category, schoolName } = options;

  const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <div style="background:linear-gradient(135deg,#f43f5e,#9d174d);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:2px;">FEE PAYMENT REMINDER</h1>
        <p style="margin:8px 0 0;color:#fecdd3;font-size:13px;">${schoolName} - Official Notification</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:18px;margin-bottom:24px;">Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
        <p style="color:#94a3b8;line-height:1.6;">This is a friendly reminder that the <strong>${category}</strong> fee for your ward is pending. To avoid automated late-fee calculation, please ensure payment is completed by the due date.</p>
        
        <div style="background:#1e293b;border-radius:16px;padding:32px;margin:32px 0;border:1px solid #334155;text-align:center;">
          <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">Pending Amount</p>
          <p style="margin:8px 0;font-size:42px;font-weight:900;color:#f8fafc;">₹${amount}</p>
          <div style="display:inline-block;padding:8px 20px;background:#ef444420;border:1px solid #ef444440;border-radius:100px;color:#f87171;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-top:10px;">
            DUE: ${formattedDate}
          </div>
        </div>

        <p style="color:#64748b;font-size:12px;text-align:center;">Please ignore if already paid. If you have any queries, contact the school accounts department.</p>
        
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0;">Institutional Revenue Management Terminal</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Finance Dept | ${schoolName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Fee Payment Reminder - ${category}`,
    html,
  });
};
