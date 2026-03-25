import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksSlice, fetchRecordsSlice, fetchHistorySlice } from '../../redux/slice/librarian.slice';
import { Library, BookOpen, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LibrarianDashboard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchBooksSlice());
        dispatch(fetchRecordsSlice());
        dispatch(fetchHistorySlice());
    }, [dispatch]);

    const { books, records, history, loading } = useSelector((state) => state.librarian);

    const estimatedFines = records.reduce((sum, r) => {
        if (r.status === 'issued' && new Date() > new Date(r.dueDate)) {
            const daysOverdue = Math.floor((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24));
            return sum + (daysOverdue * 5);
        }
        return sum + (r.fine || 0);
    }, 0);

    const stats = [
        { label: 'Archived Knowledge', value: books.length, icon: Library, color: 'text-librarian-primary' },
        { label: 'Active Circulation', value: records.filter(r => r.status === 'issued').length, icon: BookOpen, color: 'text-emerald-400' },
        { label: 'Overdue Threads', value: records.filter(r => r.status === 'overdue' || (r.status==='issued' && new Date() > new Date(r.dueDate))).length, icon: AlertCircle, color: 'text-amber-400' },
        { label: 'Pending Fines', value: estimatedFines > 0 ? `₹${estimatedFines}` : '₹0', icon: AlertCircle, color: 'text-red-400' },
        { label: 'Total Syncs', value: history.length, icon: Clock, color: 'text-slate-400' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1">Archive Matrix</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Knowledge lifecycle visualization control.</p>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-8">Recent Library Protocols</h3>
                    <div className="space-y-4">
                        {records.slice(0, 5).map((record, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-neutral-950/40 rounded-md border border-slate-800/60 border-l-2 border-l-indigo-600/40">
                                <div className="text-slate-500"><Library size={18} /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-200">{record.bookId?.title}</p>
                                    <p className="text-[10px] text-slate-500 uppercase italic">Issued to {record.borrowerId?.firstName}</p>
                                </div>
                                <span className="text-[9px] font-black uppercase text-librarian-primary italic bg-librarian-primary/10 px-2 py-0.5 rounded-md border border-librarian-primary/20">{record.status}</span>
                            </div>
                        ))}
                        {records.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">No circulation events detected.</p>}
                    </div>
                </div>
                
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-librarian-primary to-librarian-primary"></div>
                    <Library size={48} className="text-librarian-primary/40 mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic mb-4">Integrity Guard</h4>
                    <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase italic leading-relaxed">System syncing with Global Archive Cluster... <br/> No integrity breaches reported.</p>
                </div>
            </div>
        </motion.div>
    );
};

export default LibrarianDashboard;
