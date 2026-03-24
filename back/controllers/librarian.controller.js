const Book = require('../models/book.model');
const IssueRecord = require('../models/issueRecord.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');
const FeePayment = require('../models/feePayment.model');
const BookReservation = require('../models/bookReservation.model');
const bcrypt = require('bcrypt');

const getSchoolId = (req) => req.user.schoolId;

// Book CRUD
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find({ schoolId: getSchoolId(req) }).sort({ createdAt: -1 });
        res.json(books);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addBook = async (req, res) => {
    try {
        const bookData = { ...req.body, schoolId: getSchoolId(req) };
        if (req.file) bookData.fileUrl = req.file.location;
        const book = await Book.create(bookData);
        res.status(201).json({ message: 'Book added successfully', data: book });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBook = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.fileUrl = req.file.location;
        
        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            updateData, { new: true }
        );
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book updated successfully', data: book });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Issue/Return
exports.issueBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bookId, borrowerId, borrowerModel, dueDate } = req.body;
        const schoolId = getSchoolId(req);

        const book = await Book.findOne({ _id: bookId, schoolId }).session(session);
        if (!book) throw new Error('Book not found');
        if (book.availableCopies <= 0) throw new Error('No copies available');

        const record = await IssueRecord.create([{
            schoolId, bookId, borrowerId, borrowerModel: borrowerModel || 'User', issueDate: new Date(), dueDate, status: 'issued'
        }], { session });

        book.availableCopies -= 1;
        await book.save({ session });

        // Low stock detection
        if (book.availableCopies <= 1) {
            console.log(`LOW STOCK ALERT: ${book.title} has ${book.availableCopies} cycles remaining.`);
            // In a real system, you'd trigger a Notification model entry here
        }

        await session.commitTransaction();
        res.json({ message: 'Book issued successfully', data: record[0] });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

exports.returnBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const record = await IssueRecord.findOne({ _id: req.params.id, schoolId: getSchoolId(req) }).session(session);
        if (!record) throw new Error('Issue record not found');
        if (record.status === 'returned') throw new Error('Book already returned');

        const book = await Book.findById(record.bookId).session(session);
        
        record.returnDate = new Date();
        record.status = 'returned';
        
        // Calculate fine (example: 5 per day overdue)
        if (record.returnDate > record.dueDate) {
            const daysOverdue = Math.floor((record.returnDate - record.dueDate) / (1000 * 60 * 60 * 24));
            record.fine = daysOverdue * 5; 
            
            // Inject fine into student Fees module ONLY if borrower is a student
            if (record.fine > 0 && record.borrowerModel === 'Student') {
                // Determine Academic Year roughly based on current date
                const currentYear = new Date().getFullYear();
                const nextYear = currentYear + 1;
                const academicYear = `${currentYear}-${nextYear}`;

                await FeePayment.create([{
                    schoolId: getSchoolId(req),
                    studentId: record.borrowerId,
                    amount: record.fine,
                    totalAmount: record.fine,
                    paidAmount: 0,
                    category: 'Library Fine',
                    status: 'pending',
                    dueDate: record.returnDate,
                    academicYear: academicYear,
                    submittedBy: req.user._id
                }], { session });
            }
        }

        await record.save({ session });
        
        if (book) {
            book.availableCopies += 1;
            await book.save({ session });
        }

        await session.commitTransaction();
        res.json({ message: 'Book returned successfully', data: record });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

exports.getIssueRecords = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        // Auto-update overdue status on fetch
        await IssueRecord.updateMany(
            { schoolId, status: 'issued', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const records = await IssueRecord.find({ 
            schoolId,
            status: { $in: ['issued', 'overdue'] } 
        })
            .populate('bookId', 'title isbn')
            .populate('borrowerId', 'firstName lastName email role photo')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getHistory = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { status, search } = req.query;

        // Auto-update overdue status on fetch
        await IssueRecord.updateMany(
            { schoolId, status: 'issued', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        let query = { schoolId };
        if (status) query.status = status;
        
        const records = await IssueRecord.find(query)
            .populate('bookId', 'title isbn author category')
            .populate('borrowerId', 'firstName lastName email role')
            .sort({ createdAt: -1 });
        
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getBorrowers = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        
        // Fetch teachers/staff from User model
        const teachers = await User.find({ 
            schoolId, 
            role: 'Teacher'
        }).select('firstName lastName email role photo');

        // Fetch students from Student model
        const students = await Student.find({ 
            schoolId, 
            deletedAt: null 
        }).select('firstName lastName email photo admissionNumber').lean();

        // Merge and format
        const borrowers = [
            ...teachers.map(t => ({ ...t.toObject(), model: 'User' })),
            ...students.map(s => ({
                ...s,
                role: 'Student',
                model: 'Student',
                lastName: s.lastName + ` (${s.admissionNumber})`
            }))
        ];

        res.json(borrowers);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category', { schoolId: getSchoolId(req) });
        res.json(categories.filter(c => c)); // Filter empty
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.renewBook = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = getSchoolId(req);
        const record = await IssueRecord.findOne({ _id: id, schoolId });
        if (!record) return res.status(404).json({ message: 'Archival record not found' });
        if (record.status === 'returned') return res.status(400).json({ message: 'Volume already returned to matrix' });

        const newDueDate = new Date(record.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7); // Standard 7-cycle extension
        
        record.dueDate = newDueDate;
        record.renewalCount += 1;
        record.status = 'issued'; // Reset status if it was overdue
        
        await record.save();
        res.json({ message: 'Volume renewed for 7 additional cycles', data: record });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.collectFine = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const schoolId = getSchoolId(req);
        const record = await IssueRecord.findOneAndUpdate(
            { _id: id, schoolId },
            { fineStatus: status },
            { new: true }
        );
        res.json({ message: `Fine status updated to ${status} protocol`, data: record });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Profile Management ───────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'Librarian profile not found' });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const updateData = { firstName, lastName, phone };
        
        if (req.file) updateData.photo = req.file.location;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        res.json({ message: 'Profile updated successfully', data: user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Security credentials updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Reservation/Waitlist Management ──────────────────────────────────────────
exports.getReservations = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const reservations = await BookReservation.find({ schoolId })
            .populate('bookId', 'title isbn category availableCopies')
            .populate('studentId', 'firstName lastName email photo role')
            .sort({ requestDate: -1 });
        res.json(reservations);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schoolId = getSchoolId(req);

        const reservation = await BookReservation.findOneAndUpdate(
            { _id: id, schoolId },
            { status },
            { new: true }
        ).populate('bookId', 'title').populate('studentId', 'firstName lastName');

        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json({ message: `Reservation marked as ${status}`, data: reservation });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
