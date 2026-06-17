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
        
        <div style="text-align:center;margin-top:32px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
             style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:13px;box-shadow:0 10px 15px -3px rgba(37,99,235,0.4);">
            LOGIN TO TERMINAL
          </a>
        </div>

        <p style="color:#64748b;font-size:12px;margin-top:48px;border-top:1px solid #1e293b;padding-top:24px;text-align:center;">${footerNote}</p>
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

exports.sendAnnouncementMail = async (options) => {
  if (!(await isEmailEnabled())) {
      console.log('Email notifications are disabled in system settings. Skipping announcement mail.');
      return;
  }

  const { to, subject, announcementTitle, announcementContent, schoolName, authorName } = options;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:1px;">NEW ANNOUNCEMENT</h1>
        <p style="margin:8px 0 0;color:#bfdbfe;font-size:13px;">${schoolName} - Official Notification</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:18px;margin-bottom:24px;color:#f8fafc;">Dear Parent/Guardian,</p>
        <p style="color:#94a3b8;line-height:1.6;font-size:15px;">A new announcement has been published by <strong>${authorName}</strong>:</p>
        
        <div style="background:#1e293b;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #334155;">
          <h3 style="margin:0 0 12px;color:#3b82f6;font-size:18px;">${announcementTitle}</h3>
          <p style="margin:0;color:#cbd5e1;line-height:1.6;white-space:pre-wrap;">${announcementContent}</p>
        </div>

        <div style="text-align:center;margin-top:32px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
             style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:13px;box-shadow:0 10px 15px -3px rgba(37,99,235,0.4);">
            VIEW IN PORTAL
          </a>
        </div>
        
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0;">Institutional Communication Terminal</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${schoolName} Announcements" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Announcement: ${subject}`,
    html,
  });
};

exports.handleAnnouncementEmail = async (announcement, senderUser) => {
    try {
        // 1. Verify announcement type (if it's a Message model, type must be Announcement. If it's Announcement model, type is undefined but targetRole is defined)
        if (announcement.type && announcement.type !== 'Announcement') {
            return;
        }

        // 2. Verify sender role is Teacher or School_Admin
        if (!senderUser || !['Teacher', 'School_Admin'].includes(senderUser.role)) {
            return;
        }

        // 3. Determine if target includes student/parent/all
        const targetRole = announcement.targetRole || 'All';
        const classSectionId = announcement.classSection || announcement.targetClassSection;

        const targetsStudentOrParent = ['Student', 'Parent', 'All'].includes(targetRole) || classSectionId;
        if (!targetsStudentOrParent) {
            return;
        }

        // 4. Find students
        const schoolId = announcement.schoolId?._id || announcement.schoolId;
        if (!schoolId) {
            return;
        }

        const studentFilter = { schoolId, deletedAt: null };
        if (classSectionId) {
            studentFilter.classSection = classSectionId;
        }

        const Student = require('../models/student.model');
        const School = require('../models/school.model');

        const students = await Student.find(studentFilter).populate('parentId');
        if (!students || students.length === 0) {
            return;
        }

        // 5. Get school name
        const school = await School.findById(schoolId);
        const schoolName = school ? school.name : 'School Administration';

        // 6. Sender name
        const authorName = `${senderUser.firstName} ${senderUser.lastName}`;

        // 7. Collect unique parent/guardian emails
        const recipientEmails = new Set();
        for (const student of students) {
            if (student.guardianEmail) {
                recipientEmails.add(student.guardianEmail.trim().toLowerCase());
            }
            if (student.parentId && student.parentId.email) {
                recipientEmails.add(student.parentId.email.trim().toLowerCase());
            }
        }

        if (recipientEmails.size === 0) {
            return;
        }

        // 8. Subject & Content mapping
        const mailSubject = announcement.subject || announcement.title;
        const mailContent = announcement.content;

        // 9. Send emails
        const emailPromises = Array.from(recipientEmails).map(email => {
            return exports.sendAnnouncementMail({
                to: email,
                subject: mailSubject,
                announcementTitle: mailSubject,
                announcementContent: mailContent,
                schoolName,
                authorName
            }).catch(err => {
                console.error(`Failed to send announcement email to ${email}:`, err.message);
            });
        });

        await Promise.all(emailPromises);
    } catch (error) {
        console.error('Error in handleAnnouncementEmail:', error);
    }
};

exports.sendAttendanceMail = async (options) => {
  if (!(await isEmailEnabled())) {
      console.log('Email notifications are disabled in system settings. Skipping attendance mail.');
      return;
  }

  const { to, studentName, status, date, className, schoolName } = options;

  // Determine status color and gradient for premium aesthetics
  let statusColor = '#3b82f6'; // default blue
  let statusGradient = 'linear-gradient(135deg,#3b82f6,#1d4ed8)';

  if (status === 'Present') {
    statusColor = '#10b981'; // Green
    statusGradient = 'linear-gradient(135deg,#10b981,#047857)';
  } else if (status === 'Absent') {
    statusColor = '#ef4444'; // Red
    statusGradient = 'linear-gradient(135deg,#ef4444,#b91c1c)';
  } else if (status === 'Late') {
    statusColor = '#f59e0b'; // Amber/Yellow
    statusGradient = 'linear-gradient(135deg,#f59e0b,#b45309)';
  } else if (status === 'Half-Day') {
    statusColor = '#06b6d4'; // Cyan
    statusGradient = 'linear-gradient(135deg,#06b6d4,#0891b2)';
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <div style="background:${statusGradient};padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:1px;text-transform:uppercase;">ATTENDANCE RECORDED</h1>
        <p style="margin:8px 0 0;color:#e2e8f0;font-size:13px;opacity:0.9;">${schoolName} - Daily Tracking</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:18px;margin-bottom:24px;color:#f8fafc;">Dear Parent/Guardian,</p>
        <p style="color:#94a3b8;line-height:1.6;font-size:15px;">Your child's attendance status has been logged for today:</p>
        
        <div style="background:#1e293b;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #334155;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;">Student Name</td>
              <td style="padding:8px 0;font-weight:bold;color:#f8fafc;text-align:right;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;">Class</td>
              <td style="padding:8px 0;font-weight:bold;color:#f8fafc;text-align:right;">${className}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;">Date</td>
              <td style="padding:8px 0;font-weight:bold;color:#f8fafc;text-align:right;">${date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;">Status</td>
              <td style="padding:8px 0;text-align:right;">
                <span style="display:inline-block;padding:4px 12px;background:${statusColor}20;border:1px solid ${statusColor}40;border-radius:100px;color:${statusColor};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
                  ${status}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-top:32px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
             style="display:inline-block;background:${statusGradient};color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:13px;box-shadow:0 10px 15px -3px rgba(37,99,235,0.4);">
            VIEW IN PORTAL
          </a>
        </div>
        
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0;">Institutional Student Information Terminal</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${schoolName} Attendance" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Attendance Update: ${studentName} - ${status}`,
    html,
  });
};

exports.handleAttendanceEmail = async (attendance) => {
  try {
    if (!attendance || !attendance.records || attendance.records.length === 0) {
      return;
    }

    const School = require('../models/school.model');
    const Student = require('../models/student.model');
    const ClassSection = require('../models/classSection.model');
    const Standard = require('../models/standard.model');

    // Resolve school name
    const school = await School.findById(attendance.schoolId);
    const schoolName = school ? school.name : 'School Administration';

    // Resolve class details
    const classSection = await ClassSection.findById(attendance.classSection);
    const standard = await Standard.findById(attendance.standardId);
    
    let className = 'Class';
    if (standard && classSection) {
      className = `${standard.name || `Standard ${standard.level}`} - ${classSection.sectionLabel}`;
    } else if (standard) {
      className = standard.name || `Standard ${standard.level}`;
    }

    const dateStr = new Date(attendance.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Send emails for each student record in the attendance document
    const emailPromises = attendance.records.map(async (record) => {
      try {
        const student = await Student.findOne({ _id: record.studentId, deletedAt: null }).populate('parentId');
        if (!student) return;

        const recipientEmails = new Set();
        if (student.guardianEmail) {
          recipientEmails.add(student.guardianEmail.trim().toLowerCase());
        }
        if (student.parentId && student.parentId.email) {
          recipientEmails.add(student.parentId.email.trim().toLowerCase());
        }

        if (recipientEmails.size === 0) return;

        const studentName = `${student.firstName} ${student.lastName}`;

        // Send to all resolved unique emails for this student
        const sendPromises = Array.from(recipientEmails).map(email => {
          return exports.sendAttendanceMail({
            to: email,
            studentName,
            status: record.status,
            date: dateStr,
            className,
            schoolName
          }).catch(err => {
            console.error(`Failed to send attendance email to ${email}:`, err.message);
          });
        });

        await Promise.all(sendPromises);
      } catch (err) {
        console.error(`Error processing attendance email for student ${record.studentId}:`, err);
      }
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error in handleAttendanceEmail:', error);
  }
};

exports.sendBehaviorLogMail = async (options) => {
  if (!(await isEmailEnabled())) {
      console.log('Email notifications are disabled in system settings. Skipping behavior log mail.');
      return;
  }

  const { to, studentName, type, category, description, actionTaken, date, teacherName, schoolName } = options;

  // Determine status color and gradient for premium aesthetics
  let statusColor = '#3b82f6'; // default blue
  let statusGradient = 'linear-gradient(135deg,#3b82f6,#1d4ed8)';

  if (type === 'Positive') {
    statusColor = '#10b981'; // Green
    statusGradient = 'linear-gradient(135deg,#10b981,#047857)';
  } else if (type === 'Negative') {
    statusColor = '#ef4444'; // Red
    statusGradient = 'linear-gradient(135deg,#ef4444,#b91c1c)';
  } else if (type === 'Warning') {
    statusColor = '#f59e0b'; // Amber/Yellow
    statusGradient = 'linear-gradient(135deg,#f59e0b,#b45309)';
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <div style="background:${statusGradient};padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:1px;text-transform:uppercase;">BEHAVIOR LOGGED</h1>
        <p style="margin:8px 0 0;color:#e2e8f0;font-size:13px;opacity:0.9;">${schoolName} - Conduct & Discipline Registry</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:18px;margin-bottom:24px;color:#f8fafc;">Dear Parent/Guardian,</p>
        <p style="color:#94a3b8;line-height:1.6;font-size:15px;">A new behavior log entry has been documented for <strong>${studentName}</strong> by <strong>${teacherName}</strong>:</p>
        
        <div style="background:#1e293b;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #334155;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">Type</td>
              <td style="padding:8px 0;text-align:right;vertical-align:top;">
                <span style="display:inline-block;padding:4px 12px;background:${statusColor}20;border:1px solid ${statusColor}40;border-radius:100px;color:${statusColor};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
                  ${type}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">Category</td>
              <td style="padding:8px 0;font-weight:bold;color:#f8fafc;text-align:right;vertical-align:top;">${category}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">Date</td>
              <td style="padding:8px 0;font-weight:bold;color:#f8fafc;text-align:right;vertical-align:top;">${date}</td>
            </tr>
            <tr>
              <td style="padding:16px 0 8px;color:#64748b;font-size:13px;vertical-align:top;" colspan="2">Details & Description</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#0f1117;border-radius:8px;color:#cbd5e1;line-height:1.5;font-size:14px;white-space:pre-wrap;" colspan="2">${description}</td>
            </tr>
            ${actionTaken ? `
            <tr>
              <td style="padding:16px 0 8px;color:#64748b;font-size:13px;vertical-align:top;" colspan="2">Action Taken</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#ef444410;border:1px solid #ef444430;border-radius:8px;color:#f87171;line-height:1.5;font-size:14px;white-space:pre-wrap;" colspan="2">${actionTaken}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align:center;margin-top:32px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
             style="display:inline-block;background:${statusGradient};color:#fff;padding:14px 40px;border-radius:100px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:13px;box-shadow:0 10px 15px -3px rgba(37,99,235,0.4);">
            VIEW IN PORTAL
          </a>
        </div>
        
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid #1e293b;text-align:center;">
          <p style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0;">Institutional Student Conduct Terminal</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"${schoolName} Conduct Registry" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Student Conduct Entry: ${studentName} - ${type}`,
    html,
  });
};

exports.handleBehaviorLogEmail = async (behaviorLog) => {
  try {
    if (!behaviorLog) {
      return;
    }

    const School = require('../models/school.model');
    const Student = require('../models/student.model');
    const Teacher = require('../models/teacher.model');

    // Resolve school name
    const school = await School.findById(behaviorLog.schoolId);
    const schoolName = school ? school.name : 'School Administration';

    // Resolve student & parent
    const student = await Student.findOne({ _id: behaviorLog.studentId, deletedAt: null }).populate('parentId');
    if (!student) return;

    // Resolve teacher
    const teacher = await Teacher.findById(behaviorLog.teacherId);
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Class Teacher';

    const recipientEmails = new Set();
    if (student.guardianEmail) {
      recipientEmails.add(student.guardianEmail.trim().toLowerCase());
    }
    if (student.parentId && student.parentId.email) {
      recipientEmails.add(student.parentId.email.trim().toLowerCase());
    }

    if (recipientEmails.size === 0) return;

    const studentName = `${student.firstName} ${student.lastName}`;
    const dateStr = new Date(behaviorLog.date || new Date()).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Send to all resolved unique emails for this student
    const emailPromises = Array.from(recipientEmails).map(email => {
      return exports.sendBehaviorLogMail({
        to: email,
        studentName,
        type: behaviorLog.type,
        category: behaviorLog.category,
        description: behaviorLog.description,
        actionTaken: behaviorLog.actionTaken,
        date: dateStr,
        teacherName,
        schoolName
      }).catch(err => {
        console.error(`Failed to send behavior log email to ${email}:`, err.message);
      });
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error in handleBehaviorLogEmail:', error);
  }
};
