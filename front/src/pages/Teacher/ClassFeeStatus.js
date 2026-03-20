import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeeStatus } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { Search, Filter, Download, AlertCircle, CheckCircle2, DollarSign, Users, ArrowRight } from 'lucide-react';

const ClassFeeStatus = () => {
    const dispatch = useDispatch();
    const { feeStatus, loading } = useSelector((s) => s.teacher);

    useEffect(() => {
        dispatch(fetchFeeStatus());
    }, [dispatch]);

    const stats = {
        total: feeStatus.length,
        pending: feeStatus.filter(s => s.status === 'Pending').length,
        cleared: feeStatus.filter(s => s.status === 'Cleared').length,
        totalPendingAmount: feeStatus.reduce((acc, s) => acc + s.totalPending, 0)
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
                <div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit shadow-text-glow">Sector Financials</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide flex items-center gap-2 italic">
                        <DollarSign size={14} className="text-brand-primary" />
                        Class-wide fee telemetry & institutional obligation tracking.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-4 bg-slate-800/80 hover:bg-slate-700 rounded-md font-black text-[10px] uppercase tracking-widest transition-all border border-slate-700/50 shadow-xl group">
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Export Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Enrolled Nodes', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Pending Obligations', value: stats.pending, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Cleared Protocols', value: stats.cleared, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Cumulative Pending', value: `₹${stats.totalPendingAmount.toLocaleString()}`, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-md hover:border-slate-600 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</h3>
                            <div className={`p-2 rounded-md ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={16} />
                            </div>
                        </div>
                        <p className={`text-2xl font-black italic tracking-tighter ${stat.color} font-outfit`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-md shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800/80 bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-primary transition-colors" size={16} />
                        <input type="text" placeholder="Search student by identity or node number..." className="w-full bg-slate-900/50 border border-slate-800 p-3 pl-12 rounded-md focus:border-brand-primary outline-none text-xs font-bold tracking-wide transition-all" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Student Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Academic Sector</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Pending Obligation</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Telemetry Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Action Registry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center italic text-slate-600 font-bold uppercase tracking-widest animate-pulse">Synchronizing financial telemetry metrics...</td>
                                </tr>
                            ) : feeStatus.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center italic text-slate-600 font-bold uppercase tracking-widest opacity-50">No financial archives found in this sector node</td>
                                </tr>
                            ) : feeStatus.map((item, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={item.studentId} 
                                    className="hover:bg-slate-800/30 transition-all group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center font-black text-brand-primary shadow-lg italic">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white italic uppercase tracking-tighter">{item.name}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">ID: {item.admissionNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700/50 uppercase tracking-widest italic">
                                            {item.class}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className={`text-sm font-black italic tracking-tighter ${item.totalPending > 0 ? 'text-rose-400' : 'text-emerald-400'} font-outfit`}>
                                            ₹{item.totalPending.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Pending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 rounded-md border border-slate-800 bg-slate-900/50 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all hover:scale-110 active:scale-95 shadow-lg group">
                                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-amber-400/5 border border-amber-400/10 p-6 rounded-md flex items-start gap-4 italic shadow-2xl">
                <AlertCircle className="text-amber-400 shrink-0" size={20} />
                <p className="text-[11px] text-amber-400/80 leading-relaxed font-bold uppercase tracking-wide">
                    Institutional Note: Financial telemetry is read-only for pedagogical staff. For directive modifications or manual synchronization, please contact the financial administrative node.
                </p>
            </div>
        </div>
    );
};

export default ClassFeeStatus;
