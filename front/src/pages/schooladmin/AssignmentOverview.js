import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentsOverview } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { 
    BookOpen, Calendar, Users, CheckCircle, Clock, 
    Search, Filter, ChevronRight, BarChart3, 
    FileText, User, Layout, MoreVertical
} from 'lucide-react';
import moment from 'moment';

const AssignmentOverview = () => {
    const dispatch = useDispatch();
    const { assignments, loading } = useSelector((state) => state.schoolAdmin);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchAssignmentsOverview());
    }, [dispatch]);

    const filtered = assignments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${a.createdBy?.firstName} ${a.createdBy?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: assignments.length,
        totalSubmissions: assignments.reduce((acc, curr) => acc + curr.submissionCount, 0),
        avgSubmissionRate: assignments.length > 0 
            ? (assignments.reduce((acc, curr) => acc + (curr.submissionCount / (curr.totalPotential || 1)), 0) / assignments.length * 100).toFixed(1)
            : 0
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Assignment Matrix</h1>
                    <p className="text-slate-400 text-sm mt-1">Cross-institutional academic task surveillance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Filter by title, subject or teacher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-brand-border/40 rounded-md py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-brand-primary transition-all font-bold w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Directives', val: stats.total, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { label: 'Total Submissions', val: stats.totalSubmissions, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Global Completion', val: `${stats.avgSubmissionRate}%`, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-brand-surface border border-brand-border/40 rounded-md p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-md ${s.bg} flex items-center justify-center ${s.color}`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                <p className="text-2xl font-black font-outfit mt-1 text-white">{s.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && assignments.length === 0 ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-md bg-slate-800/30 animate-pulse border border-white/5" />)
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-24 text-center border border-dashed border-slate-800 rounded-md bg-slate-900/10">
                        <BookOpen size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No active directives detected in this sector</p>
                    </div>
                ) : filtered.map((a, i) => (
                    <motion.div 
                        key={a._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-brand-surface border border-brand-border/40 rounded-md p-6 hover:border-brand-primary/40 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-500/20">
                                {a.subject}
                            </span>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold">{moment(a.dueDate).format('DD MMM')}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">{a.title}</h3>
                        
                        <div className="flex items-center gap-2 mb-6">
                            <User size={14} className="text-slate-500" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                By {a.createdBy?.firstName} {a.createdBy?.lastName}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layout size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Class {a.classSection?.sectionLabel}</span>
                                </div>
                                <span className="text-[10px] font-black text-white">{a.submissionCount}/{a.totalPotential}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-md overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(a.submissionCount / (a.totalPotential || 1)) * 100}%` }}
                                    className={`h-full bg-gradient-to-r ${a.submissionCount === a.totalPotential ? 'from-emerald-600 to-teal-400' : 'from-indigo-600 to-blue-400'}`}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                                <span className="text-emerald-500">Graded: {a.gradedCount}</span>
                                <span className="text-rose-500">Late: {a.lateCount}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-brand-border/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                             <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 hover:underline">
                                View Submissions <ChevronRight size={12} />
                             </button>
                             <button className="text-slate-500 hover:text-white transition-colors">
                                <MoreVertical size={16} />
                             </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentOverview;
