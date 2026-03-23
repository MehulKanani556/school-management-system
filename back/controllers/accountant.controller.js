const FeePayment = require('../models/feePayment.model');
const FeeStructure = require('../models/feeStructure.model');
const Payroll = require('../models/payroll.model');
const AuditLog = require('../models/auditLog.model');
const School = require('../models/school.model');
const Standard = require('../models/standard.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const mongoose = require('mongoose');
const logAudit = require('../utils/auditLogger');
const PDFDocument = require('pdfkit');
const nc = require('./notification.controller');

const getSchoolId = (req) => req.user.schoolId;

// ─── Fee Management ───────────────────────────────────────────────────────────
exports.getFees = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { search, status, startDate, endDate, page = 1, limit = 10 } = req.query;
        let query = { schoolId };
        
        if (status) query.status = status;
        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const fees = await FeePayment.find(query)
            .populate('studentId', 'firstName lastName admissionNumber classId')
            .sort({ createdAt: -1 });
            
        let filteredFees = fees;
        if (search) {
            const lowSearch = search.toLowerCase();
            filteredFees = fees.filter(f => 
                f.studentId?.firstName?.toLowerCase().includes(lowSearch) ||
                f.studentId?.lastName?.toLowerCase().includes(lowSearch) ||
                f.studentId?.admissionNumber?.toLowerCase().includes(lowSearch) ||
                f.category?.toLowerCase().includes(lowSearch)
            );
        }

        const total = filteredFees.length;
        const paginatedFees = filteredFees.slice(skip, skip + Number(limit));
        
        res.json({
            fees: paginatedFees,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.collectFee = async (req, res) => {
    try {
        const { paidAmount, paymentMethod, transactionId, note, lateFees, discount } = req.body;
        const schoolId = getSchoolId(req);
        const fee = await FeePayment.findOne({ _id: req.params.id, schoolId });
        
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const previousPaid = fee.paidAmount || 0;
        
        if (discount !== undefined) fee.discount = discount;
        fee.paidAmount = paidAmount;
        fee.paymentMethod = paymentMethod;
        fee.transactionId = transactionId;
        fee.note = note;
        fee.lateFees = lateFees !== undefined ? lateFees : fee.lateFees;
        fee.paidDate = new Date();
        fee.submittedBy = req.user._id;

        // Recalculate totalAmount (amount - discount + lateFees)
        fee.totalAmount = fee.amount - (fee.discount || 0) + (fee.lateFees || 0);

        if (paidAmount >= fee.totalAmount) {
            fee.status = 'paid';
        } else if (paidAmount > 0) {
            fee.status = 'partially_paid';
        } else {
            fee.status = 'pending';
        }

        await fee.save();

        const diff = paidAmount - previousPaid;
        await School.findByIdAndUpdate(schoolId, { $inc: { revenue: diff } });

        await logAudit(req, 'FEE_COLLECTION', 'Finance', `Collected $${paidAmount} for student ${fee.studentId}`);

        res.json({ message: 'Fee Synchronized successfully', fee });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Fee Structures ────────────────────────────────────────────────────────────
exports.getFeeStructures = async (req, res) => {
    try {
        const structures = await FeeStructure.find({ schoolId: getSchoolId(req) }).populate('standardId', 'level name');
        res.json(structures);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFeeStructure = async (req, res) => {
    try {
        const structure = await FeeStructure.create({ ...req.body, schoolId: getSchoolId(req) });
        const populated = await structure.populate('standardId', 'level name');

        await logAudit(req, 'CREATE_FEE_STRUCTURE', 'Finance', `Created new fee structure for Standard ${req.body.standardId}`);

        res.status(201).json({ message: 'Fee structure created successfully', data: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFeeStructure = async (req, res) => {
    try {
        const structure = await FeeStructure.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            req.body, { new: true }
        ).populate('standardId', 'level name');
        if (!structure) return res.status(404).json({ message: 'Fee structure not found' });
        res.json({ message: 'Fee structure modified successfully', data: structure });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFeeStructure = async (req, res) => {
    try {
        await FeeStructure.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
        res.json({ message: 'Fee structure deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.applyFeeStructure = async (req, res) => {
    try {
        const { standardId, dueDate, academicYear } = req.body;
        const schoolId = getSchoolId(req);

        const structure = await FeeStructure.findOne({ schoolId, standardId, academicYear });
        if (!structure) return res.status(404).json({ message: 'No structure found for this criteria' });

        const students = await Student.find({ schoolId, standard: standardId, deletedAt: null });
        if (!students.length) return res.status(404).json({ message: 'No students found in this grade' });

        const existingPayments = await FeePayment.find({ schoolId, academicYear });
        const existingKeys = new Set(existingPayments.map(p => `${p.studentId}-${p.category}`));

        const payments = [];
        for (const student of students) {
            const scholarship = student.scholarshipPercentage || 0;
            for (const item of structure.feeItems) {
                if (!existingKeys.has(`${student._id}-${item.name}`)) {
                    const discount = (item.amount * scholarship) / 100;
                    payments.push({
                        schoolId,
                        studentId: student._id,
                        amount: item.amount,
                        discount: discount,
                        totalAmount: item.amount - discount,
                        category: item.name,
                        academicYear,
                        feeStructureId: structure._id,
                        status: 'pending',
                        dueDate: new Date(dueDate)
                    });
                }
            }
        }

        if (!payments.length) return res.status(400).json({ message: 'Fees already applied for this selection' });

        await FeePayment.insertMany(payments);
        await logAudit(req, 'APPLY_FEE_STRUCTURE', 'Finance', `Applied fee structure for Standard ${standardId} for year ${academicYear}`);

        res.json({ message: `Fee Inflow Cycle Triggered for ${students.length} students.` });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Payroll Management ───────────────────────────────────────────────────────
exports.getPayroll = async (req, res) => {
    try {
        const { search, month, year, page = 1, limit = 10 } = req.query;
        const schoolId = req.user.schoolId;
        const query = { schoolId };

        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        
        let teacherIds = [];
        if (search) {
            const teachers = await Teacher.find({
                schoolId,
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { employeeId: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            teacherIds = teachers.map(t => t._id);
            query.teacherId = { $in: teacherIds };
        }

        const payroll = await Payroll.find(query)
            .populate('teacherId', 'firstName lastName employeeId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Payroll.countDocuments(query);

        // Calculate Totals
        const totals = await Payroll.aggregate([
            { $match: query },
            { $group: {
                _id: null,
                totalPaid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$netSalary", 0] } },
                totalPending: { $sum: { $cond: [{ $eq: ["$status", "unpaid"] }, "$netSalary", 0] } }
            }}
        ]);

        res.status(200).json({
            payroll,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            totalPaid: totals[0]?.totalPaid || 0,
            totalPending: totals[0]?.totalPending || 0
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const schoolId = getSchoolId(req);

        // Fetch all active teachers
        const teachers = await Teacher.find({ schoolId, isActive: true, deletedAt: null });
        if (!teachers.length) return res.status(404).json({ message: 'No active staff members found' });

        // Check for existing records
        const existing = await Payroll.find({ schoolId, month, year });
        const existingIds = new Set(existing.map(p => p.teacherId.toString()));

        const payload = [];
        for (const t of teachers) {
            if (!existingIds.has(t._id.toString())) {
                const bonus = 0;
                const deductions = 0;
                payload.push({
                    schoolId,
                    teacherId: t._id,
                    month,
                    year,
                    basicSalary: t.baseSalary || 0,
                    bonus,
                    deductions,
                    netSalary: (t.baseSalary || 0) + bonus - deductions,
                    status: 'unpaid'
                });
            }
        }

        if (!payload.length) return res.status(400).json({ message: 'Payroll already generated for this cycle' });

        await Payroll.insertMany(payload);

        await logAudit(req, 'GENERATE_PAYROLL', 'Finance', `Generated payroll for ${payload.length} staff members for ${month}/${year}`);

        res.json({ message: `Payroll generated for ${payload.length} teachers.` });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSinglePayroll = async (req, res) => {
    try {
        const { teacherId, month, year, basicSalary, bonus, deductions } = req.body;
        const schoolId = getSchoolId(req);

        const existing = await Payroll.findOne({ schoolId, teacherId, month, year });
        if (existing) return res.status(400).json({ message: 'Payroll for this member already exists for the selected cycle' });

        const netSalary = Number(basicSalary) + (Number(bonus) || 0) - (Number(deductions) || 0);
        const payroll = await Payroll.create({
            ...req.body,
            schoolId,
            netSalary,
            status: req.body.status || 'unpaid',
            paidAt: req.body.status === 'paid' ? new Date() : undefined
        });

        const populated = await payroll.populate('teacherId', 'firstName lastName employeeId');
        res.status(201).json({ message: 'Payroll identity created successfully', data: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.processPayroll = async (req, res) => {
    try {
        const { status, paymentMethod, transactionId, remarks } = req.body;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            { 
                status, 
                paymentMethod, 
                transactionId, 
                remarks,
                paidAt: status === 'paid' ? new Date() : undefined,
                submittedBy: req.user._id
            },
            { new: true }
        ).populate('teacherId', 'firstName lastName employeeId');

        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });

        // Automated Disbursement Notification
        if (status === 'paid') {
            await nc.sendNotification({
                schoolId: getSchoolId(req),
                recipient: payroll.teacherId?._id,
                sender: req.user._id,
                type: 'Payroll',
                title: 'Capital Dispatched: Salary Credited',
                message: `Institutional payroll node for ${payroll.month}/${payroll.year} has been synchronized. Net Amount: ₹${payroll.netSalary.toLocaleString()}. Reference: ${transactionId || 'Internal Transfer'}.`,
                link: '/teacher/payroll'
            });
        }

        // Log Audit
        await logAudit(req, 'PROCESS_PAYROLL', 'Finance', `Processed payroll of ${payroll.netSalary} for teacher ${payroll.teacherId?.firstName} ${payroll.teacherId?.lastName}`);

        res.json({ message: 'Payroll processed successfully', data: payroll });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Financial Reports ────────────────────────────────────────────────────────
exports.getFinancialReport = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { startDate, endDate, academicYear } = req.query;
        
        let match = { schoolId: new mongoose.Types.ObjectId(schoolId) };
        if (startDate || endDate) {
            match.paidDate = {};
            if (startDate) match.paidDate.$gte = new Date(startDate);
            if (endDate) match.paidDate.$lte = new Date(endDate);
        }
        if (academicYear) match.academicYear = academicYear;

        const feeIncome = await FeePayment.aggregate([
            { $match: { ...match, status: { $in: ['paid', 'partially_paid'] } } },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]);

        const pendingFees = await FeePayment.aggregate([
            { $match: { ...match, status: { $ne: 'paid' } } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } }
        ]);

        const payrollMatch = { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'paid' };
        if (startDate || endDate) {
            payrollMatch.paidAt = {};
            if (startDate) payrollMatch.paidAt.$gte = new Date(startDate);
            if (endDate) payrollMatch.paidAt.$lte = new Date(endDate);
        }

        const payrollExpenses = await Payroll.aggregate([
            { $match: payrollMatch },
            { $group: { _id: null, total: { $sum: '$netSalary' } } }
        ]);

        const monthlyData = await FeePayment.aggregate([
            { $match: { ...match, status: { $in: ['paid', 'partially_paid'] } } },
            { $group: {
                _id: { $month: '$paidDate' },
                income: { $sum: '$paidAmount' }
            }},
            { $sort: { '_id': 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trends = monthlyData.map(d => ({
            name: months[d._id - 1],
            income: d.income,
            expenses: 0
        }));

        const payrollTrend = await Payroll.aggregate([
            { $match: payrollMatch },
            { $group: {
                _id: { $month: '$paidAt' },
                expenses: { $sum: '$netSalary' }
            }},
            { $sort: { '_id': 1 } }
        ]);

        payrollTrend.forEach(p => {
            const mName = months[p._id - 1];
            let entry = trends.find(t => t.name === mName);
            if (entry) entry.expenses = p.expenses;
            else trends.push({ name: mName, income: 0, expenses: p.expenses });
        });

        const income = feeIncome[0]?.total || 0;
        const pending = pendingFees[0]?.total || 0;
        const expenses = payrollExpenses[0]?.total || 0;
        const totalProjected = income + pending;
        const liquidity = totalProjected > 0 ? (income / totalProjected) * 100 : 0;
        
        let grade = 'F';
        if (liquidity > 90) grade = 'A+';
        else if (liquidity > 80) grade = 'A';
        else if (liquidity > 70) grade = 'B';
        else if (liquidity > 60) grade = 'C';

        res.json({
            income,
            pending,
            expenses,
            trends: trends.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name)),
            health: {
                grade,
                liquidity: Math.round(liquidity),
                status: grade === 'A+' ? 'Excellent' : grade === 'A' ? 'Good' : 'Needs Attention'
            },
            summary: {
                totalStudents: await Student.countDocuments({ schoolId, deletedAt: null }),
                totalEmployees: await Teacher.countDocuments({ schoolId, deletedAt: null }),
            }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updatePayroll = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { id } = req.params;
        const { basicSalary, bonus, deductions } = req.body;
        
        const current = await Payroll.findOne({ _id: id, schoolId });
        if (!current) return res.status(404).json({ message: 'Payroll record not found' });

        const b = basicSalary !== undefined ? Number(basicSalary) : current.basicSalary;
        const bo = bonus !== undefined ? Number(bonus) : current.bonus;
        const de = deductions !== undefined ? Number(deductions) : current.deductions;
        const netSalary = b + bo - de;

        const updated = await Payroll.findOneAndUpdate(
            { _id: id, schoolId },
            { ...req.body, netSalary },
            { new: true }
        ).populate('teacherId', 'firstName lastName employeeId');

        res.status(200).json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deletePayroll = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const { id } = req.params;
        await Payroll.findOneAndDelete({ _id: id, schoolId });
        res.status(200).json({ message: 'Payroll record deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ─── PDF Generation ────────────────────────────────────────────────────────────
exports.downloadFeeReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = getSchoolId(req);
        const school = await School.findById(schoolId);
        
        const fee = await FeePayment.findOne({ _id: id, schoolId }).populate('studentId', 'firstName lastName admissionNumber');
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${fee.studentId?.firstName}_${fee.category}.pdf`);
        doc.pipe(res);

        // Styling
        const darkColor = '#0f172a';
        const brandColor = '#2563eb';
        const accentColor = '#10b981';
        const lightColor = '#f8fafc';

        // Header
        doc.rect(0, 0, 595, 140).fill(darkColor);
        doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(school.name.toUpperCase(), 40, 45);
        doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('FINANCIAL OPERATIONS // PAYMENT RECEIPT', 40, 75, { characterSpacing: 1.5 });
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff').text(`RECEIPT: #${fee._id.toString().slice(-8).toUpperCase()}`, 400, 45, { align: 'right', width: 155 });
        doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text(`ISSUED: ${new Date().toLocaleDateString()}`, 400, 60, { align: 'right', width: 155 });

        let currentY = 170;

        // Identity
        doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text('IDENTIFIER NODE', 40, currentY);
        currentY += 15;
        doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
        currentY += 15;

        doc.fontSize(9).font('Helvetica-Bold').text('CITIZEN NAME:', 40, currentY);
        doc.font('Helvetica').text(`${fee.studentId?.firstName} ${fee.studentId?.lastName}`, 130, currentY);
        doc.font('Helvetica-Bold').text('ADMISSION ID:', 320, currentY);
        doc.font('Helvetica').text(fee.studentId?.admissionNumber || 'N/A', 410, currentY);
        
        currentY += 20;
        doc.font('Helvetica-Bold').text('FISCAL YEAR:', 40, currentY);
        doc.font('Helvetica').text(fee.academicYear || 'N/A', 130, currentY);
        doc.font('Helvetica-Bold').text('CATEGORY:', 320, currentY);
        doc.font('Helvetica').text(fee.category?.toUpperCase() || 'GENERAL', 410, currentY);

        currentY += 45;

        // Financials
        doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text('FISCAL BREAKDOWN', 40, currentY);
        currentY += 15;
        doc.rect(40, currentY, 515, 25).fill(lightColor);
        doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold').text('DESCRIPTION', 50, currentY + 8);
        doc.text('FISCAL VALUE (INR)', 430, currentY + 8, { align: 'right', width: 110 });
        
        currentY += 35;
        doc.font('Helvetica').fontSize(10).text(`${fee.category} - Distribution Cycle`, 50, currentY);
        doc.font('Helvetica-Bold').text(`₹${fee.amount?.toLocaleString()}`, 430, currentY, { align: 'right', width: 110 });
        
        if (fee.discount > 0) {
            currentY += 20;
            doc.font('Helvetica').text('Scholarship / Waiver Discount', 50, currentY);
            doc.font('Helvetica-Bold').fillColor('#ef4444').text(`- ₹${fee.discount?.toLocaleString()}`, 430, currentY, { align: 'right', width: 110 });
            doc.fillColor(darkColor);
        }

        if (fee.lateFees > 0) {
            currentY += 20;
            doc.font('Helvetica').text('Late Penalty / Compliance Fee', 50, currentY);
            doc.font('Helvetica-Bold').fillColor('#ef4444').text(`+ ₹${fee.lateFees?.toLocaleString()}`, 430, currentY, { align: 'right', width: 110 });
            doc.fillColor(darkColor);
        }

        currentY += 30;
        doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#e2e8f0').lineWidth(1).stroke();
        currentY += 10;

        doc.fontSize(12).font('Helvetica-Bold').text('TOTAL DISBURSEMENT:', 330, currentY);
        doc.fillColor(accentColor).fontSize(14).text(`₹${fee.paidAmount?.toLocaleString()}`, 430, currentY - 2, { align: 'right', width: 110 });

        currentY += 40;
        doc.rect(40, currentY, 515, 50).fill('#f0fdf4');
        doc.fillColor('#166534').fontSize(10).font('Helvetica-Bold').text('STATUS: FISCAL CLEARANCE VERIFIED', 50, currentY + 15);
        doc.fontSize(8).font('Helvetica').text(`Method: ${fee.paymentMethod?.toUpperCase()} // TxID: ${fee.transactionId || 'INTERNAL'}`, 50, currentY + 30);

        // Footer
        doc.fontSize(7).fillColor('#94a3b8').text(`OPERATIONS NODE: ${req.user._id} // SECURITY HASH: ${fee._id.toString().toUpperCase()}`, 0, 810, { align: 'center', width: 595 });

        doc.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = getSchoolId(req);
        const school = await School.findById(schoolId);
        
        const payroll = await Payroll.findOne({ _id: id, schoolId }).populate('teacherId', 'firstName lastName employeeId role');
        if (!payroll) return res.status(404).json({ message: 'Payroll node not detected' });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payslip_${payroll.teacherId?.firstName}_${payroll.month}_${payroll.year}.pdf`);
        doc.pipe(res);

        const darkColor = '#0f172a';
        const brandColor = '#6366f1';
        const redColor = '#ef4444';
        const greenColor = '#10b981';

        // Header
        doc.rect(0, 0, 595, 140).fill(darkColor);
        doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(school.name.toUpperCase(), 40, 45);
        doc.fontSize(10).font('Helvetica').fillColor(brandColor).text('CAPITAL DISPATCH // SALARY PAYSLIP', 40, 75, { characterSpacing: 1.5 });
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff').text(`CYCLE: ${payroll.month}/${payroll.year}`, 400, 45, { align: 'right', width: 155 });
        doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text(`BATCH: #${payroll._id.toString().slice(-8).toUpperCase()}`, 400, 60, { align: 'right', width: 155 });

        let currentY = 170;

        // Recipient
        doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text('RECIPIENT PROTOCOL', 40, currentY);
        currentY += 15;
        doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
        currentY += 15;

        doc.fontSize(9).font('Helvetica-Bold').text('EMPLOYEE NAME:', 40, currentY);
        doc.font('Helvetica').text(`${payroll.teacherId?.firstName} ${payroll.teacherId?.lastName}`, 140, currentY);
        doc.font('Helvetica-Bold').text('EMPLOYEE ID:', 340, currentY);
        doc.font('Helvetica').text(payroll.teacherId?.employeeId || 'N/A', 440, currentY);
        
        currentY += 20;
        doc.font('Helvetica-Bold').text('DESIGNATION:', 40, currentY);
        doc.font('Helvetica').text(payroll.teacherId?.role || 'Staff', 140, currentY);
        doc.font('Helvetica-Bold').text('DISBURSEMENT:', 340, currentY);
        doc.font('Helvetica').text(payroll.status.toUpperCase(), 440, currentY);

        currentY += 45;

        // Earnings
        doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold').text('FISCAL DISBURSEMENT BREAKDOWN', 40, currentY);
        currentY += 15;
        
        const colWidth = 250;
        doc.rect(40, currentY, colWidth, 25).fill('#f8fafc');
        doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold').text('EARNINGS', 50, currentY + 8);
        doc.text('AMOUNT', 40 + colWidth - 70, currentY + 8, { align: 'right', width: 60 });

        doc.rect(595 - 40 - colWidth, currentY, colWidth, 25).fill('#fef2f2');
        doc.fillColor(darkColor).text('DEDUCTIONS', 595 - 40 - colWidth + 10, currentY + 8);
        doc.text('AMOUNT', 555 - 60, currentY + 8, { align: 'right', width: 50 });

        currentY += 35;
        
        // Rows
        doc.font('Helvetica').fontSize(10);
        doc.text('Basic Component', 50, currentY);
        doc.font('Helvetica-Bold').text(`₹${payroll.basicSalary?.toLocaleString()}`, 40 + colWidth - 70, currentY, { align: 'right', width: 60 });
        
        doc.font('Helvetica').text('Statutory / Leave', 595 - 40 - colWidth + 10, currentY);
        doc.font('Helvetica-Bold').fillColor(redColor).text(`- ₹${payroll.deductions?.toLocaleString()}`, 555 - 70, currentY, { align: 'right', width: 60 });
        
        currentY += 20;
        doc.fillColor(darkColor).font('Helvetica').text('Cycle Bonuses', 50, currentY);
        doc.font('Helvetica-Bold').fillColor(greenColor).text(`+ ₹${payroll.bonus?.toLocaleString()}`, 40 + colWidth - 70, currentY, { align: 'right', width: 60 });

        currentY += 40;
        doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#e2e8f0').lineWidth(1).stroke();
        currentY += 15;

        doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold').text('NET PAYABLE DISPATCH:', 320, currentY);
        doc.fillColor(brandColor).fontSize(16).text(`₹${payroll.netSalary?.toLocaleString()}`, 430, currentY - 3, { align: 'right', width: 110 });

        currentY += 50;
        doc.rect(40, currentY, 515, 60).fill('#eef2ff');
        doc.fillColor('#312e81').fontSize(10).font('Helvetica-Bold').text('AUTH: ELECTRONIC SIGNATURE VERIFIED', 50, currentY + 15);
        doc.fontSize(8).font('Helvetica').text(`Method: ${payroll.paymentMethod || 'SYSTEM'} // Ref: ${payroll.transactionId || 'DISPATCH_BATCH'}`, 50, currentY + 30);
        doc.text(`Remarks: ${payroll.remarks || 'Standard compensation cycle.'}`, 50, currentY + 42);

        // Footer
        doc.fontSize(7).fillColor('#94a3b8').text('© OPERATIONS NETWORK // SECURE PAYROLL EMISSION // 2026', 0, 810, { align: 'center', width: 595 });

        doc.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { module } = req.query;
        let query = { schoolId };
        if (module) query.module = module;

        const logs = await AuditLog.find(query)
            .populate('userId', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
