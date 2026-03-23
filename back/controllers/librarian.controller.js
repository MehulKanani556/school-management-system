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
        const records = await IssueRecord.find({ schoolId: getSchoolId(req) })
            .populate('bookId', 'title isbn')
            .populate('borrowerId', 'firstName lastName email role')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
