import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistorySlice } from '../../redux/slice/librarian.slice';
import { History, Search, Filter, User, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const CirculationHistory = () => {
    const dispatch = useDispatch();
    const { history, loading } = useSelector((state) => state.librarian);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    useEffect(() => {
        dispatch(fetchHistorySlice({ status: statusFilter === 'all' ? '' : statusFilter }));
    }, [dispatch, statusFilter]);

    const filteredHistory = (history || []).filter(r => 
        r.bookId?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        r.borrowerId?.firstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        r.borrowerId?.lastName?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-emerald-500 italic uppercase tracking-tighter mb-1 leading-none">Circulation Archive</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Historical log of all knowledge transfers.</p>
                </div>
                <div className="flex gap-4">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-neutral-900 border border-slate-800/60 rounded-md px-4 py-2 text-[10px] font-black uppercase italic text-slate-400 focus:outline-none focus:border-emerald-600/50 transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="issued">Active Issued</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Archived Threads</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify entry..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-600/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-950/50 border-b border-slate-800/60 font-outfit">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Volume & Custodian</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Temporal Range</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Status Matrix</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Librarian Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-outfit">
                            {filteredHistory.length > 0 ? filteredHistory.map((record, i) => (
                                <tr key={i} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800/60 flex items-center justify-center text-slate-600">
                                                <BookOpen size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight leading-none mb-1.5 group-hover/row:text-emerald-400 transition-all">{record.bookId?.title}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 uppercase italic opacity-60 font-black">{record.borrowerId?.firstName} {record.borrowerId?.lastName}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">{record.borrowerId?.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-slate-400 italic">{moment(record.issueDate).format('DD MMM / YYYY')}</span>
                                                <ChevronRight size={10} className="text-slate-700" />
                                                <span className="text-[10px] font-black text-slate-300 italic">
                                                    {record.returnDate ? moment(record.returnDate).format('DD MMM / YYYY') : 'Active Cycle'}
                                                </span>
                                            </div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Issue vs Termination</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic mb-1 ${record.status === 'issued' ? 'bg-amber-600/10 border-amber-600/20 text-amber-500' : record.status === 'returned' ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                                                {record.status}
                                            </span>
                                            {record.fine > 0 && <span className="text-[9px] font-black text-red-500 italic opacity-80">FINE: ₹{record.fine}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="text-[9px] font-black text-slate-700 uppercase italic tracking-widest leading-none">ID: {record._id?.toString().slice(-6)}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">Archive history is currently empty in this sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default CirculationHistory;
