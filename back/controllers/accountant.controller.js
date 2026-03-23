const FeePayment = require('../models/feePayment.model');
const FeeStructure = require('../models/feeStructure.model');
const Payroll = require('../models/payroll.model');
const School = require('../models/school.model');
const Standard = require('../models/standard.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const mongoose = require('mongoose');

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
        const { paidAmount, paymentMethod, transactionId, note, lateFees } = req.body;
        const schoolId = getSchoolId(req);
        const fee = await FeePayment.findOne({ _id: req.params.id, schoolId });
        
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const previousPaid = fee.paidAmount || 0;
        
        fee.paidAmount = paidAmount;
        fee.paymentMethod = paymentMethod;
        fee.transactionId = transactionId;
        fee.note = note;
        fee.lateFees = lateFees || fee.lateFees;
        fee.paidDate = new Date();
        fee.submittedBy = req.user._id;

        if (paidAmount >= (fee.amount - fee.discount + (fee.lateFees || 0))) {
            fee.status = 'paid';
        } else if (paidAmount > 0) {
            fee.status = 'partially_paid';
        } else {
            fee.status = 'pending';
        }

        await fee.save();

        const diff = paidAmount - previousPaid;
        await School.findByIdAndUpdate(schoolId, { $inc: { revenue: diff } });

        res.json({ message: 'Fee collected successfully', data: fee });
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
        res.json({ message: `Successfully generated ${payments.length} fee records` });
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
        res.json({ message: `Successfully generated ${payload.length} payroll nodes`, count: payload.length });
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
