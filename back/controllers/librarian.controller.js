const Book = require('../models/book.model');
const IssueRecord = require('../models/issueRecord.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');

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
        const book = await Book.create({ ...req.body, schoolId: getSchoolId(req) });
        res.status(201).json({ message: 'Book added successfully', data: book });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            req.body, { new: true }
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
        const { bookId, borrowerId, dueDate } = req.body;
        const schoolId = getSchoolId(req);

        const book = await Book.findOne({ _id: bookId, schoolId }).session(session);
        if (!book) throw new Error('Book not found');
        if (book.availableCopies <= 0) throw new Error('No copies available');

        const record = await IssueRecord.create([{
            schoolId, bookId, borrowerId, issueDate: new Date(), dueDate, status: 'issued'
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
        
        // Calculate fine (example: 1 per day overdue)
        if (record.returnDate > record.dueDate) {
            const daysOverdue = Math.floor((record.returnDate - record.dueDate) / (1000 * 60 * 60 * 24));
            record.fine = daysOverdue * 5; 
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
        const users = await User.find({ 
            schoolId, 
            role: { $in: ['Student', 'Teacher'] } 
        }).select('firstName lastName email role photo');
        res.json(users);
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
