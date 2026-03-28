import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRecordsSlice, returnBookSlice, fetchBooksSlice, issueBookSlice, fetchBorrowersSlice } from '../../redux/slice/librarian.slice';
import { Clock, Search, RotateCcw, User, Calendar, Plus, BookOpen, Library, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const IssueRecords = ({ type = 'all' }) => {
    const dispatch = useDispatch();
    const { records, books, borrowers, success } = useSelector((state) => state.librarian);
    const [isIssueOpen, setIsIssueOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [borrowerSearch, setBorrowerSearch] = React.useState('');
    const [formData, setFormData] = React.useState({ 
        bookId: '', 
        borrowerId: '', 
        borrowerModel: 'User', 
        dueDate: moment().add(14, 'days').format('YYYY-MM-DD') 
    });
    const [selectedReturnRecord, setSelectedReturnRecord] = React.useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = React.useState(false);

    useEffect(() => {
        dispatch(fetchRecordsSlice());
        dispatch(fetchBooksSlice());
        dispatch(fetchBorrowersSlice());
    }, [dispatch, success]);

    const filteredRecords = records.filter(r => {
        const matchesSearch = 
            r.bookId?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            r.borrowerId?.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            r.borrowerId?.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase());
            
        if (type === 'return') {
            return matchesSearch && r.status !== 'returned';
        }
        return matchesSearch;
    });

    const filteredBorrowers = (borrowers || []).filter(b => 
        (b.firstName + ' ' + b.lastName).toLowerCase().includes(borrowerSearch.toLowerCase()) ||
        b.email?.toLowerCase()?.includes(borrowerSearch.toLowerCase())
    );

    const getEstimatedFine = (record) => {
        if (!record || !record.dueDate || record.status === 'returned') return 0;
        const due = moment(record.dueDate);
        const now = moment();
        if (now.isAfter(due)) {
            const days = now.diff(due, 'days');
            return days * 5; // Standard protocol: 5 per cycle
        }
        return 0;
    };

    const handleReturn = (record) => {
        setSelectedReturnRecord(record);
        setIsReturnModalOpen(true);
    };

    const confirmReturn = () => {
        if (selectedReturnRecord) {
            dispatch(returnBookSlice(selectedReturnRecord._id));
            setIsReturnModalOpen(false);
            setSelectedReturnRecord(null);
        }
    };

    const handleIssue = (e) => {
        e.preventDefault();
        dispatch(issueBookSlice(formData));
        setFormData({ 
            bookId: '', 
            borrowerId: '', 
            borrowerModel: 'User', 
            dueDate: moment().add(14, 'days').format('YYYY-MM-DD') 
        });
        setBorrowerSearch('');
        setIsIssueOpen(false);
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-librarian-primary">
                        {type === 'return' ? 'Manage Returns' : 'Book Issues'}
                    </h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">
                        {type === 'return' ? 'Process book returns and calculate fines.' : 'Track and manage book issuance history.'}
                    </p>
                </div>
                {type !== 'return' && (
                    <button 
                        onClick={() => setIsIssueOpen(true)}
                        className="px-6 py-3 bg-librarian-primary text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-librarian-primary/20 hover:translate-y-[-2px] transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> issue book
                    </button>
                )}
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none font-outfit">
                        {type === 'return' ? 'Pending Returns' : 'Recent Issue Records'}
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by student or book title..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-950/50 border-b border-slate-800/60">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Book Title</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Borrower Name</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Issue & Due Date</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredRecords.length > 0 ? filteredRecords.map((record, i) => (
                                <tr key={i} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6 font-outfit">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-200 tracking-tight leading-none mb-1.5 group-hover/row:text-librarian-primary transition-all uppercase">{record.bookId?.title}</span>
                                            <span className="text-[10px] text-slate-500 uppercase italic opacity-60">ISBN: {record.bookId?.isbn}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800/60 flex items-center justify-center text-slate-600">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <Link to={`/school-admin/profile/${record.borrowerId?._id}`} className="block">
                                                    <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1 hover:text-librarian-primary transition-colors cursor-pointer">
                                                        {record.borrowerId?.firstName} {record.borrowerId?.lastName}
                                                    </span>
                                                </Link>
                                                <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{record.borrowerId?.role} Name</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-slate-400 opacity-60 italic">{moment(record.issueDate).format('DD MMM')}</span>
                                                <ChevronRight size={10} className="text-slate-700" />
                                                <span className={`text-[10px] font-black italic ${moment().isAfter(record.dueDate) && record.status !== 'returned' ? 'text-red-500 shadow-[0_0_5px_rgba(239,68,68,0.2)]' : 'text-slate-300'}`}>{moment(record.dueDate).format('DD MMM')}</span>
                                            </div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Duration</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic mb-1 ${record.status === 'issued' ? 'bg-librarian-primary/10 border-librarian-primary/20 text-librarian-primary' : record.status === 'returned' ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                                                {record.status}
                                            </span>
                                            {record.fine > 0 && <span className="text-[10px] font-black text-red-400 italic">Fine: ₹{record.fine}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        {record.status !== 'returned' && (
                                            <button 
                                                onClick={() => handleReturn(record)}
                                                className="p-2.5 text-slate-500 bg-neutral-950 border border-slate-800 inline-flex items-center gap-2 hover:text-librarian-primary hover:border-librarian-primary/40 rounded-md transition-all opacity-0 group-hover/row:opacity-100"
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Return Book</span>
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                        {record.status === 'returned' && <div className="text-[9px] font-black uppercase text-emerald-500/40 italic">Returned</div>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">No active book issues found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isIssueOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-0">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsIssueOpen(false)} 
                            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleIssue} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Issue New Book</h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Select Book</label>
                                        <select 
                                            required
                                            value={formData.bookId}
                                            onChange={(e) => setFormData({...formData, bookId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all custom-scrollbar"
                                        >
                                            <option value="">Select Book...</option>
                                            {books.filter(b => b.availableCopies > 0).map(b => (
                                                <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Student / Staff Member (Search)</label>
                                        <div className="relative group/search">
                                            <Search className="absolute left-3 top-3.5 text-slate-600" size={12} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by name or email..."
                                                value={borrowerSearch}
                                                onChange={(e) => setBorrowerSearch(e.target.value)}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-t-md py-3 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all italic leading-none"
                                            />
                                            <div className="max-h-32 overflow-y-auto bg-neutral-950 border-x border-b border-slate-800/60 rounded-b-md custom-scrollbarThin">
                                                {filteredBorrowers.length > 0 ? filteredBorrowers.map(b => (
                                                    <button
                                                        key={b._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData, 
                                                                borrowerId: b._id, 
                                                                borrowerModel: b.model || 'User'
                                                            });
                                                            setBorrowerSearch(`${b.firstName} ${b.lastName}`);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase italic transition-all flex items-center justify-between ${formData.borrowerId === b._id ? 'bg-librarian-primary/20 text-librarian-primary' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                                                    >
                                                        <span>{b.firstName} {b.lastName}</span>
                                                        <span className="text-[8px] opacity-40">{b.role}</span>
                                                    </button>
                                                )) : (
                                                    <div className="px-4 py-3 text-[10px] text-slate-600 italic">No members found...</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Due Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all italic leading-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsIssueOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Cancel</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-librarian-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-librarian-primary transition-all shadow-xl shadow-librarian-primary/20 leading-none">Issue Book</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isReturnModalOpen && selectedReturnRecord && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-0">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsReturnModalOpen(false)} 
                            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-md rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
                                    <div className="p-2 bg-librarian-primary/10 rounded-md text-librarian-primary">
                                        <RotateCcw size={20} />
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Confirm Book Return</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-neutral-950/50 border border-slate-800/40 rounded-md">
                                        <p className="text-[10px] font-black uppercase text-slate-500 italic mb-1">Book Title</p>
                                        <p className="text-sm font-bold text-slate-200 uppercase">{selectedReturnRecord.bookId?.title}</p>
                                        <p className="text-[9px] text-slate-600 italic">ISBN: {selectedReturnRecord.bookId?.isbn}</p>
                                    </div>

                                    <div className="p-4 bg-neutral-950/50 border border-slate-800/40 rounded-md">
                                        <p className="text-[10px] font-black uppercase text-slate-500 italic mb-1">Borrower Name</p>
                                        <p className="text-sm font-bold text-slate-200 uppercase">{selectedReturnRecord.borrowerId?.firstName} {selectedReturnRecord.borrowerId?.lastName}</p>
                                        <p className="text-[9px] text-slate-600 italic tracking-widest uppercase">{selectedReturnRecord.borrowerId?.role} Records</p>
                                    </div>

                                    {moment().isAfter(selectedReturnRecord.dueDate) ? (
                                        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-md animate-pulse">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] font-black uppercase text-red-500 italic">Overdue Alert</p>
                                                <span className="text-red-400 font-bold text-xs italic">-{moment().diff(moment(selectedReturnRecord.dueDate), 'days')} Days</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] text-red-400/60 italic">Calculated Fine Amount:</p>
                                                <p className="text-lg font-black text-red-500 italic leading-none">₹{getEstimatedFine(selectedReturnRecord)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-md">
                                            <p className="text-[10px] font-black uppercase text-emerald-500 italic mb-1">On-Time Return</p>
                                            <p className="text-[9px] text-emerald-400/60 italic">No fine applicable for this return.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button onClick={() => setIsReturnModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Cancel</button>
                                    <button onClick={confirmReturn} className="flex-1 px-6 py-4 bg-librarian-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-librarian-primary transition-all shadow-xl shadow-librarian-primary/20 leading-none">Confirm Return</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IssueRecords;
