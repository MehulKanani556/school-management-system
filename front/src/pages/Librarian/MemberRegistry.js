import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBorrowersSlice, fetchRecordsSlice, fetchHistorySlice } from '../../redux/slice/librarian.slice';
import { Users, Search, Mail, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemberRegistry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { borrowers, records, history, loading } = useSelector((state) => state.librarian);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedMember, setSelectedMember] = React.useState(null);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);

    useEffect(() => {
        dispatch(fetchBorrowersSlice());
        dispatch(fetchRecordsSlice());
        dispatch(fetchHistorySlice({ status: '' }));
    }, [dispatch]);

    const handleViewAnalytics = (member) => {
        setSelectedMember(member);
        setIsAnalyticsOpen(true);
    };

    const getMemberStats = (memberId) => {
        const activeIssues = (records || []).filter(r => r.borrowerId?._id === memberId);
        const pastIssues = (history || []).filter(h => h.borrowerId?._id === memberId);
        const totalBorrowed = activeIssues.length + pastIssues.length;
        const overdue = activeIssues.filter(r => new Date(r.dueDate) < new Date()).length;
        const totalFines = pastIssues.reduce((sum, h) => sum + (h.fine || 0), 0);

        return { totalBorrowed, activeCount: activeIssues.length, overdue, totalFines };
    };

    const filteredMembers = (borrowers || []).filter(b => 
        ((b.firstName || '') + ' ' + (b.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-librarian-primary italic uppercase tracking-tighter mb-1 leading-none">Library Members</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">List of all students and staff registered to borrow books.</p>
                </div>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Member List</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-librarian-primary/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-x divide-y divide-slate-800/40">
                    {filteredMembers.length > 0 ? filteredMembers.map((member, i) => (
                        <div key={i} className="p-6 hover:bg-neutral-950/60 transition-all group/card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-30 transition-all">
                                <Users size={40} className="text-librarian-primary" />
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-md bg-neutral-950 border border-slate-800/60 overflow-hidden flex items-center justify-center text-slate-600 shadow-inner group-hover/card:border-librarian-primary/40 transition-all">
                                    {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User size={24} />}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span 
                                        className="font-bold text-base text-slate-100 tracking-tight leading-none mb-2 group-hover/card:text-librarian-primary transition-all uppercase italic cursor-pointer"
                                        onClick={() => navigate(`/librarian/profile/${member._id}`)}
                                    >
                                        {member.firstName} {member.lastName}
                                    </span>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail size={12} className="text-librarian-primary/60" />
                                            <span className="text-[10px] font-bold lowercase tracking-wider truncate max-w-[150px]">{member.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={12} className="text-librarian-primary/60" />
                                            <span className="text-[9px] font-black text-librarian-primary border border-librarian-primary/20 bg-librarian-primary/5 px-2 py-0.5 rounded-md uppercase italic tracking-[0.1em]">{member.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                                <button 
                                    onClick={() => handleViewAnalytics(member)}
                                    className="text-[9px] font-black uppercase text-slate-500 hover:text-librarian-primary italic tracking-widest transition-all"
                                >
                                    View Reports
                                </button>
                                <span className="text-[9px] font-black text-slate-700 italic opacity-40 uppercase">ID: {member._id?.toString().slice(-6)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-brand-border/50 rounded-xl">
                           <Users size={32} className="mx-auto mb-3 opacity-20" />
                           <p className="text-xs uppercase tracking-widest font-black">No members found in the registry.</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isAnalyticsOpen && selectedMember && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsAnalyticsOpen(false)} 
                            className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl"
                        ></motion.div>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 30 }} 
                            className="bg-neutral-900 w-full max-w-lg rounded-2xl border border-white/5 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-neutral-950 border border-slate-800/60 overflow-hidden p-0.5 flex items-center justify-center shadow-xl">
                                        {selectedMember.photo ? <img src={selectedMember.photo} alt="" className="w-full h-full object-cover rounded-sm" /> : <User size={20} className="text-slate-600" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-librarian-primary leading-none mb-1">{selectedMember.firstName} {selectedMember.lastName}</h3>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold italic opacity-60">Borrowing Statistics</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAnalyticsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <Shield size={16} className="text-slate-600" />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(getMemberStats(selectedMember._id)).map(([key, value]) => (
                                        <div key={key} className="p-5 bg-neutral-950 rounded-xl border border-white/5 group hover:border-librarian-primary/30 transition-all">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2 group-hover:text-librarian-primary transition-colors">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className={`text-2xl font-black italic tracking-tighter ${key === 'overdue' && value > 0 ? 'text-red-500' : 'text-slate-100'}`}>
                                                {key === 'totalFines' ? `₹${value}` : value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <div className="bg-librarian-primary/5 rounded-xl border border-librarian-primary/10 p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-librarian-primary animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-librarian-primary italic">Member Status</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 italic font-bold leading-relaxed pr-4">
                                            {getMemberStats(selectedMember._id).overdue > 0 
                                                ? 'Warning: This member has overdue books. Please check their return status.' 
                                                : 'Active: This member has a clean record and no overdue books.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={() => setIsAnalyticsOpen(false)}
                                    className="px-8 py-3 bg-librarian-primary text-white text-[10px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-librarian-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MemberRegistry;
