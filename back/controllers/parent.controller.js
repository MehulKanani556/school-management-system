const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const Mark = require('../models/mark.model');
const FeePayment = require('../models/feePayment.model');
const Timetable = require('../models/timetable.model');
const Assignment = require('../models/assignment.model');
const Holiday = require('../models/holiday.model');
const Exam = require('../models/exam.model');
const Submission = require('../models/submission.model');
const User = require('../models/user.model');
const School = require('../models/school.model');
const Meeting = require('../models/meeting.model');
const BehaviorLog = require('../models/behaviorLog.model');
const Route = require('../models/route.model');
const Vehicle = require('../models/vehicle.model');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');
const nc = require('./notification.controller');
const { Cashfree, CFEnvironment } = require('cashfree-pg');

// Institutional Global Gateway Registry (v5/v6 Instance Mode)
const cashfree = new Cashfree();
cashfree.XClientId = process.env.CASHFREE_APP_ID;
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
cashfree.XApiVersion = "2023-08-01";

exports.getMyChildren = async (req, res) => {
    try {
        const children = await Student.find({ parentId: req.user._id, isActive: true })
            .populate('standard', 'name level')
            .populate('classSection', 'sectionLabel name')
            .lean();

        res.status(200).json(children);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChildOverview = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId })
            .populate('standard', 'level')
            .populate('classSection', 'sectionLabel');
        if (!student) return res.status(404).json({ message: "Child link not found" });

        // Correctly calculate attendance from nested records
        const attendanceDocs = await Attendance.find({ 'records.studentId': studentId }).lean();
        const total = attendanceDocs.length;
        const present = attendanceDocs.filter(doc =>
            doc.records.find(r => r.studentId.toString() === studentId && ['Present', 'Late', 'Half-Day'].includes(r.status))
        ).length;
        const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        const marksDocs = await Mark.find({ studentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'examId',
                populate: { path: 'subject' }
            })
            .lean();

        const recentMarks = marksDocs.map(m => ({
            ...m,
            totalMarks: m.examId?.maxMarks || 100,
            subjectId: m.examId?.subject,
            examId: { ...m.examId, title: m.examId?.name }
        }));

        const pendingFees = await FeePayment.find({ studentId, status: 'pending' }).lean();

        res.status(200).json({
            attendancePercentage,
            recentMarks,
            pendingFees,
            student
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChildAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;

        const filter = { 'records.studentId': studentId };
        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const attendanceRecords = await Attendance.find(filter)
            .sort({ date: -1 })
            .lean();

        const history = attendanceRecords.map(record => {
            const myRecord = record.records.find(r => r.studentId.toString() === studentId);
            return {
                ...record,
                status: myRecord?.status || 'N/A',
                arrivalTime: myRecord?.arrivalTime,
                remarks: myRecord?.remarks
            };
        });

        res.status(200).json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const marks = await Mark.find({ studentId })
            .populate({
                path: 'examId',
                populate: { path: 'subject' }
            })
            .lean();

        // Map to match frontend expectations
        const formatted = marks.map(m => ({
            ...m,
            totalMarks: m.examId?.maxMarks || 100,
            examId: {
                ...m.examId,
                title: m.examId?.name // Frontend expects 'title'
            },
            subjectId: m.examId?.subject // Frontend expects 'subjectId'
        }));

        res.status(200).json(formatted);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildFees = async (req, res) => {
    try {
        const { studentId } = req.params;
        const fees = await FeePayment.find({ studentId }).sort({ dueDate: 1 }).lean();
        res.status(200).json(fees);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildTimetable = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Child not found" });

        const timetable = await Timetable.findOne({ standardId: student.standard, classSection: student.classSection })
            .populate('schedule.periods.subject').populate('schedule.periods.teacher')
            .lean();

        res.status(200).json(timetable);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Child link inactive" });

        const assignments = await Assignment.find({ classSection: student.classSection })
            .populate('subject', 'name')
            .sort({ dueDate: 1 })
            .lean();

        // Join with submissions
        const submissions = await Submission.find({ studentId }).lean();
        const data = assignments.map(a => {
            const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
            return {
                ...a,
                submission: sub || null,
                status: sub ? sub.status : 'Pending'
            };
        });

        res.json(data);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildExams = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Child link inactive" });

        const exams = await Exam.find({
            standardId: student.standard,
            isPublished: true
        }).populate('subject', 'name').sort({ date: 1 }).lean();

        res.json(exams);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({ schoolId: req.user.schoolId })
            .sort({ startDate: 1 })
            .lean();
        res.status(200).json(holidays);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Document Generation ──────────────────────────────────────────────────────

exports.downloadChildReportCard = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, parentId: req.user._id })
            .populate('standard classSection schoolId');
        if (!student) return res.status(404).json({ message: 'Child link unauthorized' });

        const marks = await Mark.find({ studentId: student._id })
            .populate({
                path: 'examId',
                match: { isPublished: true },
                populate: { path: 'subject' }
            });

        const validMarks = marks.filter(m => m.examId !== null);

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${student.firstName}.pdf`);
        doc.pipe(res);

        // Reuse styling from student controller...
        const darkColor = '#1e293b';
        doc.rect(0, 0, 595, 120).fill(darkColor);
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text(student.schoolId?.name?.toUpperCase() || 'INSTITUTIONAL RECORD', 40, 45);
        doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('GUARDIAN VERIFIED ACADEMIC REPORT', 40, 75, { characterSpacing: 2 });

        doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold').text(`STUDENT: ${student.firstName} ${student.lastName}`, 40, 150);
        doc.fontSize(10).font('Helvetica').text(`GRADE: ${student.standard?.level || 'N/A'} // SECTION: ${student.classSection?.sectionLabel || 'N/A'}`, 40, 170);

        let y = 220;
        doc.rect(40, y, 515, 25).fill('#f8fafc');
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('SUBJECT', 50, y + 8);
        doc.text('EXAM', 250, y + 8);
        doc.text('MARKS', 450, y + 8, { align: 'right', width: 60 });
        y += 30;

        validMarks.forEach(m => {
            doc.fillColor(darkColor).font('Helvetica').fontSize(9).text(m.examId.subject?.name?.toUpperCase() || 'N/A', 50, y);
            doc.text(m.examId.name || 'N/A', 250, y);
            doc.font('Helvetica-Bold').text(`${m.marksObtained} / ${m.examId.maxMarks || 100}`, 450, y, { align: 'right', width: 60 });
            y += 20;
        });

        doc.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.downloadChildFeeReceipt = async (req, res) => {
    try {
        const { feeId } = req.params;
        const fee = await FeePayment.findById(feeId).populate('studentId schoolId');
        if (!fee || fee.studentId.parentId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Fee record node unauthorized' });
        }

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${fee._id}.pdf`);
        doc.pipe(res);

        doc.rect(0, 0, 595, 120).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('FEE PAYMENT RECEIPT', 40, 50);
        doc.fontSize(10).fillColor('#10b981').text('TRANSACTION VERIFIED', 40, 75);

        doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('FINANCIAL DELTA', 40, 150);
        doc.fontSize(10).font('Helvetica').text(`STUDENT: ${fee.studentId.firstName} ${fee.studentId.lastName}`, 40, 170);
        doc.text(`CATEGORY: ${fee.category}`, 40, 185);
        doc.text(`AMOUNT PAID: INR ${fee.paidAmount || fee.totalAmount}`, 40, 200);

        doc.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Account Management ──────────────────────────────────────────────────────

exports.getParentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateParentProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, address } = req.body;
        const updateData = { firstName, lastName, phoneNumber, address };
        if (req.file) updateData.photo = req.file.location || req.file.path;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        res.json({ message: 'Guardian node updated', user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changeParentPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Auth mismatch: Incorrect legacy credentials' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Security node synchronized' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildMeetings = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, parentId: req.user._id });
        if (!student) return res.status(403).json({ message: 'Child link unauthorized' });

        const meetings = await Meeting.find({
            $or: [
                { studentId },
                { classSection: student.classSection, scope: 'Class' }
            ]
        })
            .populate('teacherId', 'firstName lastName')
            .sort({ date: 1, startTime: 1 })
            .lean();
        res.json(meetings);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getChildBehaviorLogs = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, parentId: req.user._id });
        if (!student) return res.status(403).json({ message: 'Child link unauthorized' });

        const logs = await BehaviorLog.find({ 
            studentId, 
            schoolId: student.schoolId._id // Enforce school-wide isolation
        })
            .populate('teacherId', 'firstName lastName')
            .sort({ date: -1 })
            .lean();
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
}
// ─── Transport & Logistics ──────────────────────────────────────────────────
exports.getChildTransport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const route = await Route.findOne({
            'assignedStudents.studentId': studentId
        }).populate('vehicleId').lean();

        if (!route) {
            return res.status(200).json(null);
        }

        const assignment = route.assignedStudents.find(as => as.studentId.toString() === studentId);

        res.status(200).json({
            route,
            assignment
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.applyForTransport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, parentId: req.user._id });
        if (!student) return res.status(404).json({ message: "Student record link unauthorized" });

        if (student.transportStatus !== 'None') {
            return res.status(400).json({ message: `Current logistical status: ${student.transportStatus}. Application cannot be duplicated.` });
        }

        student.transportStatus = 'Applied';
        await student.save();

        // Notify Transporter/Admin
        const transporters = await User.find({ schoolId: student.schoolId, role: 'Transport_Manager' });
        for (const t of transporters) {
            await nc.sendNotification({
                schoolId: student.schoolId,
                recipient: t._id,
                sender: req.user._id,
                type: 'Transport',
                title: 'New Transport Application',
                message: `Logistics request for ${student.firstName} ${student.lastName} has been filed and is awaiting route assignment.`,
                link: '/transporter/routes'
            });
        }

        res.json({ message: 'Transport application synthesized. Awaiting administrative clearance.', student });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Financial Transactions ──────────────────────────────────────────────────
exports.payFee = async (req, res) => {
    try {
        const { feeId } = req.params;
        const fee = await FeePayment.findById(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const student = await Student.findById(fee.studentId);
        if (student.parentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized transaction' });
        }

        // Creating Cashfree Order
        const orderId = `ORDER-${fee._id}-${Date.now()}`;
        const request = {
            "order_amount": fee.totalAmount,
            "order_currency": "INR",
            "order_id": orderId,
            "customer_details": {
                "customer_id": req.user._id.toString(),
                "customer_name": `${req.user.firstName} ${req.user.lastName}`,
                "customer_email": req.user.email,
                "customer_phone": req.user.phone || req.user.contact || "9999999999"
            },
            "order_meta": {
                "return_url": `${process.env.CLIENT_URL || 'http://localhost:3000'}/parent/fees?order_id={order_id}`
            }
        };

        const response = await cashfree.PGCreateOrder(request);
        res.status(200).json({
            success: true,
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id
        });

    } catch (err) {
        console.error('CASHFREE_INIT_ERROR:', err.response?.data || err.message);
        res.status(500).json({
            message: err.message,
            detail: err.response?.data || 'Check backend logs for mission details'
        });
    }
};

exports.verifyFeePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const response = await cashfree.PGOrderFetchPayments(orderId);

        // Check if any payment is successful
        const successPayment = response.data.find(p => p.payment_status === 'SUCCESS');

        if (successPayment) {
            // Find feeId from orderId (Format: ORDER-{feeId}-...)
            const parts = orderId.split('-');
            const feeId = parts.slice(1, -1).join('-');
            const fee = await FeePayment.findById(feeId);
            if (fee && fee.status !== 'paid') {
                fee.status = 'paid';
                fee.paidAmount = fee.totalAmount;
                fee.paymentMethod = 'online';
                fee.transactionId = successPayment.cf_payment_id;
                await fee.save();

                const student = await Student.findById(fee.studentId).populate('standard');

                // Notify Parent
                await nc.sendNotification({
                    schoolId: student.schoolId,
                    recipient: student.parentId,
                    sender: student.parentId,
                    type: 'Fee',
                    title: 'Institutional Reconciliation Complete',
                    message: `Financial delta of ₹${fee.totalAmount} for ${student.firstName} has been synchronized. Receipt Generated.`,
                    link: '/parent/fees'
                });

                // Notify Accountant
                const accountants = await User.find({ schoolId: student.schoolId, role: 'Accountant' });
                for (const accountant of accountants) {
                    await nc.sendNotification({
                        schoolId: student.schoolId,
                        recipient: accountant._id,
                        sender: student.parentId,
                        type: 'Fee',
                        title: 'New Online Fee Settlement',
                        message: `Payment of ₹${fee.totalAmount} has been registered for ${student.firstName} (Standard: ${student.standard?.name || 'N/A'}).`,
                        link: '/school-admin/fees' // Assuming path for accountant/admin
                    });
                }

                return res.status(200).json({ success: true, message: 'Institutional credit verified and ledger updated.', fee });
            }
        }

        res.status(400).json({ success: false, message: 'Transaction pending or verification failed.' });

    } catch (err) { res.status(500).json({ message: err.message }); }
};

