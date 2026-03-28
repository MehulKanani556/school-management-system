import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksSlice, fetchRecordsSlice, fetchHistorySlice } from '../../redux/slice/librarian.slice';
import { Library, BookOpen, Clock, AlertCircle, Loader2, History, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const LibrarianDashboard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchBooksSlice());
        dispatch(fetchRecordsSlice());
        dispatch(fetchHistorySlice());
    }, [dispatch]);

    const { books, records, history, loading } = useSelector((state) => state.librarian);

    const estimatedFines = (records || []).reduce((sum, r) => {
        if (r.status === 'issued' && new Date() > new Date(r.dueDate)) {
            const daysOverdue = Math.floor((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24));
            return sum + (daysOverdue * 5);
        }
        return sum + (r.fine || 0);
    }, 0);

    const historicalFines = (history || []).reduce((sum, h) => sum + (h.fine || 0), 0);
    const totalFines = estimatedFines + historicalFines;
    const fineHistory = (history || []).filter(h => h.fine > 0).slice(0, 5);

    const stats = [
        { label: 'Total Books', value: books.length, icon: Library, color: 'text-librarian-primary' },
        { label: 'Books Issued', value: records.filter(r => r.status === 'issued').length, icon: BookOpen, color: 'text-emerald-400' },
        { label: 'Overdue Books', value: records.filter(r => r.status === 'overdue' || (r.status==='issued' && new Date() > new Date(r.dueDate))).length, icon: AlertCircle, color: 'text-amber-400' },
        { label: 'Total Fines', value: totalFines > 0 ? `₹${totalFines}` : '₹0', icon: IndianRupee, color: 'text-red-400' },
        { label: 'Total Transactions', value: history.length, icon: Clock, color: 'text-slate-400' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Library Overview</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Real-time summary of library activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 p-8 rounded-md border border-slate-800/60 relative overflow-hidden group hover:border-librarian-primary/30 transition-all duration-300 shadow-xl">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-md bg-neutral-950/60 border border-slate-800/60 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 italic uppercase mb-2 leading-none font-outfit tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-8 flex items-center gap-2">
                        <History size={14} className="text-librarian-primary" /> Recent Activities
                    </h3>
                    <div className="space-y-4">
                        {records.slice(0, 5).map((record, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-neutral-950/40 rounded-md border border-slate-800/60 border-l-2 border-l-indigo-600/40 hover:bg-neutral-950/60 transition-colors">
                                <div className="text-slate-500"><Library size={18} /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-200 uppercase italic tracking-tighter">{record.bookId?.title}</p>
                                    <p className="text-[10px] text-slate-500 uppercase italic">Issued to {record.borrowerId?.firstName} {record.borrowerId?.lastName}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase text-librarian-primary italic bg-librarian-primary/10 px-2 py-0.5 rounded-md border border-librarian-primary/20">{record.status}</span>
                            </div>
                        ))}
                        {records.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No recent activities found.</p>}
                    </div>
                </div>
                
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-8 flex items-center gap-2">
                        <IndianRupee size={14} className="text-red-500" /> Fine Collection History
                    </h3>
                    <div className="space-y-4">
                        {fineHistory.map((h, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-red-950/5 border border-red-500/10 rounded-md border-l-2 border-l-red-500/40 hover:bg-red-950/10 transition-colors">
                                <div className="text-red-500/60"><AlertCircle size={18} /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-200 uppercase italic tracking-tighter">{h.bookId?.title}</p>
                                    <p className="text-[10px] text-slate-500 uppercase italic">Returned by {h.borrowerId?.firstName} {h.borrowerId?.lastName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-red-500 italic">₹{h.fine}</span>
                                    <p className="text-[8px] text-slate-600 uppercase font-black italic">Overdue fine</p>
                                </div>
                            </div>
                        ))}
                        {fineHistory.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No fines collected yet.</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LibrarianDashboard;
