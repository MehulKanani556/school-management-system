const FeePayment = require('../models/feePayment.model');
const FeeStructure = require('../models/feeStructure.model');
const Payroll = require('../models/payroll.model');
const School = require('../models/school.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const mongoose = require('mongoose');

const getSchoolId = (req) => req.user.schoolId;

// ─── Fee Management ───────────────────────────────────────────────────────────
exports.getFees = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const fees = await FeePayment.find({ schoolId })
            .populate('studentId', 'firstName lastName admissionNumber')
            .sort({ createdAt: -1 });
        res.json(fees);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.collectFee = async (req, res) => {
    try {
        const { paidAmount, paymentMethod, transactionId, note } = req.body;
        const schoolId = getSchoolId(req);
        const fee = await FeePayment.findOne({ _id: req.params.id, schoolId });
        
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const previousPaid = fee.paidAmount || 0;
        
        fee.paidAmount = paidAmount;
        fee.paymentMethod = paymentMethod;
        fee.transactionId = transactionId;
        fee.note = note;
        fee.paidDate = new Date();

        if (paidAmount >= fee.totalAmount) {
            fee.status = 'paid';
        } else if (paidAmount > 0) {
            fee.status = 'partially_paid';
        } else {
            fee.status = 'pending';
        }

        await fee.save();

        // Update school revenue
        const diff = paidAmount - previousPaid;
        await School.findByIdAndUpdate(schoolId, { $inc: { revenue: diff } });

        res.json({ message: 'Fee collected successfully', data: fee });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeeStructures = async (req, res) => {
    try {
        const structures = await FeeStructure.find({ schoolId: getSchoolId(req) })
            .populate('standardId', 'level name');
        res.json(structures);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Payroll Management ───────────────────────────────────────────────────────
exports.getPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.find({ schoolId: getSchoolId(req) })
            .populate('teacherId', 'firstName lastName employeeId')
            .sort({ month: -1, year: -1 });
        res.json(payroll);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.processPayroll = async (req, res) => {
    try {
        const { status, paymentMethod, transactionId } = req.body;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            { status, paymentMethod, transactionId, paidAt: status === 'paid' ? new Date() : undefined },
            { new: true }
        ).populate('teacherId', 'firstName lastName employeeId');

        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
        res.json({ message: 'Payroll processed successfully', data: payroll });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Financial Reports ────────────────────────────────────────────────────────
exports.getFinancialReport = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        
        // Income (Fees)
        const feeIncome = await FeePayment.aggregate([
            { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: { $in: ['paid', 'partially_paid'] } } },
            { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]);

        // Pending Fees
        const pendingFees = await FeePayment.aggregate([
            { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: { $ne: 'paid' } } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$paidAmount'] } } } }
        ]);

        // Expenses (Payroll Paid)
        const payrollExpenses = await Payroll.aggregate([
            { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$netSalary' } } }
        ]);

        res.json({
            income: feeIncome[0]?.total || 0,
            pending: pendingFees[0]?.total || 0,
            expenses: payrollExpenses[0]?.total || 0,
            summary: {
                totalStudents: await Student.countDocuments({ schoolId, deletedAt: null }),
                totalEmployees: await Teacher.countDocuments({ schoolId, deletedAt: null }),
            }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
