import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecordsSlice, returnBookSlice, fetchBooksSlice, issueBookSlice } from '../../redux/slice/librarian.slice';
import { Clock, Search, RotateCcw, User, Calendar, Plus, BookOpen, Library, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const IssueRecords = () => {
    const dispatch = useDispatch();
    const { records, books, success } = useSelector((state) => state.librarian);
    const [isIssueOpen, setIsIssueOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({ bookId: '', borrowerId: '', dueDate: moment().add(14, 'days').format('YYYY-MM-DD') });

    useEffect(() => {
        dispatch(fetchRecordsSlice());
        dispatch(fetchBooksSlice());
    }, [dispatch, success]);

    const handleReturn = (id) => {
        dispatch(returnBookSlice(id));
    };

    const handleIssue = (e) => {
        e.preventDefault();
        dispatch(issueBookSlice(formData));
        setIsIssueOpen(false);
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-amber-500">Circulation Logistics</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Tracking knowledge thread movements in the platform.</p>
                </div>
                <button 
                    onClick={() => setIsIssueOpen(true)}
                    className="px-6 py-3 bg-amber-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-amber-600/20 hover:translate-y-[-2px] transition-all flex items-center gap-2"
                >
                    <Plus size={14} /> issue volume
                </button>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none font-outfit">Active Threads</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify borrower..." 
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-950/50 border-b border-slate-800/60">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Volume Identity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Borrower Node</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Circulation Cycle</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status Loop</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {records.length > 0 ? records.map((record, i) => (
                                <tr key={i} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6 font-outfit">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-200 tracking-tight leading-none mb-1.5 group-hover/row:text-amber-500 transition-all uppercase">{record.bookId?.title}</span>
                                            <span className="text-[10px] text-slate-500 uppercase italic opacity-60">ISBN: {record.bookId?.isbn}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800/60 flex items-center justify-center text-slate-600">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1">{record.borrowerId?.firstName} {record.borrowerId?.lastName}</span>
                                                <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{record.borrowerId?.role} node</span>
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
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Temporal Window</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${record.status === 'issued' ? 'bg-amber-600/10 border-amber-600/20 text-amber-500' : record.status === 'returned' ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        {record.status !== 'returned' && (
                                            <button 
                                                onClick={() => handleReturn(record._id)}
                                                className="p-2.5 text-slate-500 bg-neutral-950 border border-slate-800 inline-flex items-center gap-2 hover:text-amber-500 hover:border-amber-600/40 rounded-md transition-all opacity-0 group-hover/row:opacity-100"
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">de-cycle link</span>
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                        {record.status === 'returned' && <div className="text-[9px] font-black uppercase text-emerald-500/40 italic">Link Terminated</div>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">Archive circulation is currently dormant.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isIssueOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsIssueOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleIssue} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Initiate circulation thread</h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Target Volume</label>
                                        <select 
                                            required
                                            value={formData.bookId}
                                            onChange={(e) => setFormData({...formData, bookId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all custom-scrollbar"
                                        >
                                            <option value="">Select Knowledge Block...</option>
                                            {books.filter(b => b.availableCopies > 0).map(b => (
                                                <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Institutional Borrower (User ID)</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Paste citizen hash/ID..."
                                            value={formData.borrowerId}
                                            onChange={(e) => setFormData({...formData, borrowerId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all italic leading-none"
                                        />
                                        <p className="text-[8px] font-bold text-slate-600 italic px-1 opacity-60">Borrower must be a registered node in the platform.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Cycle Expiry (Due Date)</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsIssueOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort thread</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-amber-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 leading-none">confirm circulation</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IssueRecords;
