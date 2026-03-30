const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true }, // base amount
  discount: { type: Number, default: 0 },
  lateFees: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }, // amount - discount + lateFees
  paidAmount: { type: Number, default: 0 },
  transactionId: { type: String },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online', 'cheque'] },
  category: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue', 'partially_paid'], default: 'pending' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

feePaymentSchema.pre('save', function(next) {
  this.totalAmount = (this.amount || 0) - (this.discount || 0) + (this.lateFees || 0);
  next();
});

feePaymentSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    
    // Recalculate if any component of totalAmount or paidAmount is being modified
    if (update.amount !== undefined || update.discount !== undefined || update.lateFees !== undefined || update.paidAmount !== undefined) {
        try {
            // Find current document to get values for fields NOT included in the update
            const doc = await this.model.findOne(this.getQuery());
            if (doc) {
                const amount = update.amount !== undefined ? update.amount : doc.amount;
                const discount = update.discount !== undefined ? update.discount : doc.discount;
                const lateFees = update.lateFees !== undefined ? update.lateFees : doc.lateFees;
                const paidAmount = update.paidAmount !== undefined ? update.paidAmount : doc.paidAmount;
                
                const totalAmount = (amount || 0) - (discount || 0) + (lateFees || 0);

                // Update the totalAmount in the update object
                this.set({ totalAmount });

                // Automatic Status Resolution Protocol
                let status = update.status || doc.status;
                if (paidAmount >= totalAmount && totalAmount > 0) {
                    status = 'paid';
                } else if (paidAmount > 0 && paidAmount < totalAmount) {
                    status = 'partially_paid';
                } else if (paidAmount === 0 && totalAmount > 0) {
                    status = 'pending';
                }
                
                this.set({ status });
                if (status === 'paid' && !update.paidDate && !doc.paidDate) {
                    this.set({ paidDate: new Date() });
                }
            }
        } catch (err) {
            console.error('PROTOCOL FAILURE: Fee recalculation hook aborted.', err);
        }
    }
    next();
});


feePaymentSchema.index({ schoolId: 1, studentId: 1, category: 1, academicYearId: 1 }, { unique: true });

// Institutional Revenue Synchronization Protocol
feePaymentSchema.post('save', async function(doc) {
    if (doc.status === 'paid' && doc.paidAmount > 0) {
        try {
            const School = mongoose.model('School');
            const totalRevenueResult = await mongoose.model('FeePayment').aggregate([
                { $match: { schoolId: doc.schoolId, status: 'paid' } },
                { $group: { _id: null, total: { $sum: "$paidAmount" } } }
            ]);
            const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].total : 0;
            await School.findByIdAndUpdate(doc.schoolId, { revenue: totalRevenue });
        } catch (error) {
            console.error('SECURE REVENUE SYNC FAILED:', error);
        }
    }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
