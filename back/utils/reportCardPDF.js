const PDFDocument = require('pdfkit');

/**
 * Generates a redesigned, premium academic report card PDF.
 * @param {Object} res - Express response stream
 * @param {Object} school - School document details
 * @param {Object} student - Student profile details
 * @param {Object} standard - Standard/grade details
 * @param {Object} classSection - Class section details
 * @param {Array} marks - List of exam marks
 * @param {String} academicYearName - Active academic session label (e.g. "2026-2027")
 */
exports.generatePDF = (res, school, student, standard, classSection, marks, academicYearName) => {
  const doc = new PDFDocument({ margin: 45, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${student.firstName}_${student.lastName}.pdf`);
  doc.pipe(res);

  // Constants for design tokens
  const colorPrimary = '#1e3a8a';   // Deep Blue
  const colorDark = '#0f172a';      // Slate 900
  const colorSecondary = '#475569'; // Slate 600
  const colorLight = '#f8fafc';     // Slate 50
  const colorBorder = '#cbd5e1';    // Slate 300
  const colorAccent = '#2563eb';    // Royal Blue

  // Grading scale helper matching frontend and backend
  const getPerformanceGrade = (pct) => {
    if (pct >= 90) return { label: 'A+', color: '#10b981' }; // Success green
    if (pct >= 80) return { label: 'A', color: '#10b981' };
    if (pct >= 70) return { label: 'B', color: '#2563eb' }; // Royal blue
    if (pct >= 60) return { label: 'C', color: '#f59e0b' }; // Amber
    if (pct >= 40) return { label: 'D', color: '#f59e0b' };
    return { label: 'F', color: '#ef4444' }; // Rose/Red
  };

  // 1. Top accent bar
  doc.rect(0, 0, 595, 12).fill(colorAccent);

  // 2. Header
  // School Name (with wrap auto-alignment preventing overlaps)
  doc.fillColor(colorDark)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text(school.name.toUpperCase(), 45, 32, { width: 380, lineGap: 2 });

  doc.fillColor(colorSecondary)
     .fontSize(9)
     .font('Helvetica')
     .text('OFFICIAL ACADEMIC PERFORMANCE TRANSCRIPT', 45, doc.y + 4, { characterSpacing: 1.2 });

  // Academic Session Badge
  const sessionText = `SESSION ${academicYearName || '2026-2027'}`;
  doc.roundedRect(440, 32, 110, 28, 4).fill('#e2e8f0');
  doc.fillColor('#1e293b')
     .fontSize(9)
     .font('Helvetica-Bold')
     .text(sessionText, 440, 41, { align: 'center', width: 110 });

  let currentY = 95;

  // Horizontal divider
  doc.moveTo(45, currentY).lineTo(550, currentY).strokeColor('#e2e8f0').lineWidth(0.75).stroke();
  currentY += 15;

  // 3. Student Information Card
  doc.roundedRect(45, currentY, 505, 75, 6).fill(colorLight);
  doc.roundedRect(45, currentY, 505, 75, 6).strokeColor(colorBorder).lineWidth(0.75).stroke();

  // Student Info Details
  doc.fontSize(8).font('Helvetica-Bold').fillColor(colorSecondary);
  doc.text('STUDENT NAME', 60, currentY + 12);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colorDark);
  doc.text(`${student.firstName} ${student.lastName}`, 60, currentY + 23, { width: 200 });

  doc.fontSize(8).font('Helvetica-Bold').fillColor(colorSecondary);
  doc.text('ADMISSION NUMBER', 300, currentY + 12);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colorDark);
  doc.text(student.admissionNumber || 'N/A', 300, currentY + 23, { width: 200 });

  doc.fontSize(8).font('Helvetica-Bold').fillColor(colorSecondary);
  doc.text('GRADE / STANDARD', 60, currentY + 44);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colorDark);
  doc.text(standard?.name || `Grade ${standard?.level || 'N/A'}`, 60, currentY + 55, { width: 200 });

  doc.fontSize(8).font('Helvetica-Bold').fillColor(colorSecondary);
  doc.text('CLASS SECTION', 300, currentY + 44);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(colorDark);
  doc.text(classSection?.sectionLabel || 'N/A', 300, currentY + 55, { width: 200 });

  currentY += 95;

  // 4. Academic Record Table Title
  doc.fillColor(colorPrimary).fontSize(11).font('Helvetica-Bold').text('ACADEMIC RECORD REGISTRY', 45, currentY);
  currentY += 15;
  doc.moveTo(45, currentY).lineTo(550, currentY).strokeColor(colorBorder).lineWidth(0.5).stroke();
  currentY += 12;

  // Table Headers
  const colSubject = 45;
  const colExam = 230;
  const colMarks = 380;
  const colTotal = 445;
  const colGrade = 505;

  doc.rect(45, currentY, 505, 24).fill('#1e293b'); // dark header
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5);
  doc.text('SUBJECT DOMAIN', colSubject + 10, currentY + 7);
  doc.text('EXAMINATION CYCLE', colExam + 10, currentY + 7);
  doc.text('OBTAINED', colMarks + 5, currentY + 7, { width: 55, align: 'center' });
  doc.text('MAX MARKS', colTotal + 5, currentY + 7, { width: 55, align: 'center' });
  doc.text('GRADE', colGrade + 5, currentY + 7, { width: 35, align: 'center' });

  currentY += 24;

  let totalObtained = 0;
  let totalMax = 0;

  marks.forEach((m, idx) => {
    // Add page if table overflows
    if (currentY > 680) {
      doc.addPage();
      // Draw top bar for subsequent pages
      doc.rect(0, 0, 595, 12).fill(colorAccent);
      currentY = 50;
    }

    const subjectName = m.examId?.subject?.name || 'Subject';
    const examName = m.examId?.name || 'Standard Assessment';
    const obtained = m.marksObtained;
    const max = m.examId?.maxMarks || 100;
    const percentage = ((obtained / max) * 100).toFixed(0);
    const itemGrade = getPerformanceGrade(parseFloat(percentage));

    totalObtained += obtained;
    totalMax += max;

    // Alternating rows bg
    if (idx % 2 === 1) {
      doc.rect(45, currentY, 505, 24).fill('#f8fafc');
    }

    doc.fillColor(colorDark).font('Helvetica').fontSize(9);
    doc.text(subjectName.toUpperCase(), colSubject + 10, currentY + 8, { width: 175, height: 12, ellipsis: true });
    doc.text(examName, colExam + 10, currentY + 8, { width: 140, height: 12, ellipsis: true });
    doc.font('Helvetica-Bold').text(obtained.toString(), colMarks + 5, currentY + 8, { width: 55, align: 'center' });
    doc.font('Helvetica').text(max.toString(), colTotal + 5, currentY + 8, { width: 55, align: 'center' });
    
    // Draw colored grade letters
    doc.fillColor(itemGrade.color).font('Helvetica-Bold').text(itemGrade.label, colGrade + 5, currentY + 8, { width: 35, align: 'center' });

    // Grid divider line
    doc.moveTo(45, currentY + 24).lineTo(550, currentY + 24).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
    currentY += 24;
  });

  currentY += 25;

  // 5. Result Summary Card
  if (currentY > 600) {
    doc.addPage();
    doc.rect(0, 0, 595, 12).fill(colorAccent);
    currentY = 50;
  }

  const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGradeObj = getPerformanceGrade(overallPct);

  // Redesigned premium full-width card with 4 symmetric columns, preventing overlaps
  doc.roundedRect(45, currentY, 505, 65, 6).fill(colorLight);
  doc.roundedRect(45, currentY, 505, 65, 6).strokeColor(colorBorder).lineWidth(0.75).stroke();

  // Column 1: Total Score
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(colorSecondary).text('TOTAL MARKS', 65, currentY + 16);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(colorDark).text(`${totalObtained} / ${totalMax}`, 65, currentY + 30);

  // Column 2: Percentage
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(colorSecondary).text('PERCENTAGE', 185, currentY + 16);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(colorDark).text(`${overallPct.toFixed(1)}%`, 185, currentY + 30);

  // Column 3: Result Status
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(colorSecondary).text('RESULT STATUS', 305, currentY + 16);
  const statusText = overallPct >= 40 ? 'PASS / VERIFIED' : 'FAIL / AUDIT REQUIRED';
  const statusColor = overallPct >= 40 ? '#10b981' : '#ef4444';
  doc.fontSize(11).font('Helvetica-Bold').fillColor(statusColor).text(statusText, 305, currentY + 32);

  // Column 4: Final Grade
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(colorSecondary).text('FINAL GRADE', 465, currentY + 13, { align: 'center', width: 60 });
  doc.roundedRect(465, currentY + 25, 60, 26, 4).fill(overallGradeObj.color);
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(overallGradeObj.label, 465, currentY + 31, { align: 'center', width: 60 });

  // 6. Signatures (At the absolute bottom of the report card page)
  const signatureY = 740;
  doc.moveTo(45, signatureY).lineTo(170, signatureY).strokeColor(colorSecondary).lineWidth(0.5).stroke();
  doc.moveTo(235, signatureY).lineTo(360, signatureY).strokeColor(colorSecondary).lineWidth(0.5).stroke();
  doc.moveTo(425, signatureY).lineTo(550, signatureY).strokeColor(colorSecondary).lineWidth(0.5).stroke();

  doc.fillColor(colorSecondary).fontSize(7.5).font('Helvetica-Bold');
  doc.text('CLASS TEACHER SIGNATURE', 45, signatureY + 8, { width: 125, align: 'center' });
  doc.text('PRINCIPAL ENDORSEMENT', 235, signatureY + 8, { width: 125, align: 'center' });
  doc.text('PARENT / GUARDIAN', 425, signatureY + 8, { width: 125, align: 'center' });

  // 7. Page Footer
  // Temporarily disable bottom margin checks to prevent auto page break when drawing footer near the bottom edge
  const oldBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  
  const footerDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.fontSize(7).fillColor('#94a3b8').font('Helvetica').text(`${school.name.toUpperCase()}  |  SECURED ACADEMIC TRANSCRIPT  |  GENERATED ON ${footerDate}`, 0, 810, { align: 'center', width: 595 });

  doc.page.margins.bottom = oldBottomMargin;
  doc.end();
};
