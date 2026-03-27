import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeeStatus, fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, AlertCircle, CheckCircle2, DollarSign, Users, ArrowRight, TrendingUp, ShieldAlert, CreditCard, Activity, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const ClassFeeStatus = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { feeStatus, loading, classes } = useSelector((s) => s.teacher);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchFeeStatus({ classId: selectedClass }));
    }, [dispatch, selectedClass]);

    const stats = {
        total: feeStatus.length,
        pending: feeStatus.filter(s => s.status === 'Pending').length,
        cleared: feeStatus.filter(s => s.status === 'Cleared').length,
        totalPendingAmount: feeStatus.reduce((acc, s) => acc + s.totalPending, 0)
    };

    const filteredStatus = feeStatus.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-12 pb-12 animate-in fade-in duration-1000">
            {/* Header Module */}
            <header className="relative overflow-hidden rounded-md border border-slate-800/60 bg-slate-950/40 p-8 md:p-12 group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] group-hover:bg-brand-primary/20 transition-all duration-1000" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <CreditCard className="text-brand-primary" size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-outfit text-white leading-none">
                                Sector <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-400">Financials</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 max-w-xl">
                            <Activity size={12} className="text-brand-primary animate-pulse" />
                            Class-Wide Fee Telemetry & Institutional Obligation Tracking Matrix.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group/select">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within/select:scale-110 transition-transform" size={16} />
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-md pl-12 pr-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer text-slate-300 min-w-[220px]"
                            >
                                <option value="all">ALL SECTORS</option>
                                {classes?.map(c => (
                                    <option key={c._id} value={c._id}>
                                        NODE: {c.standardId?.level || c.gradeLevel}-{c.sectionLabel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            onClick={() => toast.success('Telemetry report exporting...')}
                            className="flex items-center gap-3 px-8 py-5 bg-slate-900 hover:bg-brand-primary text-slate-300 hover:text-white rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-slate-800 hover:border-brand-primary/50 shadow-2xl group active:scale-95"
                        >
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> 
                            Export Protocol
                        </button>
                    </div>
                </div>
            </header>

            {/* Metric Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Enrolled Nodes', value: stats.total, icon: Users, color: 'text-blue-400', glow: 'shadow-blue-500/10', border: 'border-blue-500/20' },
                    { label: 'Pending Obligations', value: stats.pending, icon: ShieldAlert, color: 'text-teacher-primary', glow: 'shadow-rose-500/10', border: 'border-rose-500/20' },
                    { label: 'Cleared Protocols', value: stats.cleared, icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Cumulative Pending', value: `₹${stats.totalPendingAmount.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-400', glow: 'shadow-amber-500/10', border: 'border-amber-500/20' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                        key={stat.label} 
                        className={`bg-slate-900/60 border ${stat.border} p-8 rounded-md transition-all group relative overflow-hidden flex flex-col justify-between h-44 shadow-2xl`}
                    >
                        <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon size={120} />
                        </div>
                        
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</span>
                            <div className={`p-2.5 rounded-md bg-slate-800 ${stat.color} group-hover:bg-slate-700 transition-colors`}>
                                <stat.icon size={16} />
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <p className={`text-3xl font-black tracking-tighter ${stat.color} font-outfit mb-1`}>{stat.value}</p>
                            <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className={`h-full bg-current ${stat.color}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Registry */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-1">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors duration-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY IDENTITY..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800/80 p-5 pl-14 rounded-md focus:border-brand-primary/50 focus:bg-slate-900 outline-none text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 placeholder:text-slate-600 shadow-xl" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Pending', 'Cleared'].map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-6 py-4 rounded-md border text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${statusFilter === filter ? 'bg-brand-primary border-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-brand-primary/40'}`}
                            >
                                {filter} Archives
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded-md overflow-hidden backdrop-blur-3xl shadow-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-800">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Student Node Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit text-center">Academic Sector</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Pending Obligation</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Telemetry Status</th>
                                    {/* <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Control</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-primary rounded-full animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 animate-pulse">Synchronizing financial logic...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStatus.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 py-12 opacity-40">
                                                <Search size={40} className="text-slate-600 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Null registry state for current parameters</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStatus.map((item, i) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={item.studentId} 
                                        className="hover:bg-slate-900/40 transition-all group"
                                    >
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="relative w-14 h-14 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center font-black text-brand-primary shadow-2xl z-10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                                        {item.photo ? (
                                                            <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="uppercase">
                                                                {item.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="absolute -inset-1 bg-brand-primary/20 blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="space-y-1.5 flex flex-col items-start">
                                                    <button 
                                                        onClick={() => navigate(`/teacher/profile/${item.studentId}`)}
                                                        className="text-sm font-black text-white uppercase tracking-tight hover:text-brand-primary transition-colors cursor-pointer text-left focus:outline-none"
                                                    >
                                                        {item.name}
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.admissionNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex justify-center">
                                                <span className="text-[9px] font-black text-slate-400 bg-slate-900/80 px-4 py-2 rounded-md border border-slate-800 uppercase tracking-widest group-hover:border-slate-700 transition-colors">
                                                    {item.class}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-1 ">
                                                <p className={`text-lg font-black tracking-tighter ${item.totalPending > 0 ? 'text-rose-400' : 'text-emerald-400'} font-outfit`}>
                                                    ₹{item.totalPending.toLocaleString()}
                                                </p>
                                                {item.totalPending > 0 && <span className="text-[8px] font-black uppercase text-rose-400/50 tracking-widest italic">Action Required</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-md border ${item.status === 'Pending' ? 'bg-rose-400/5 border-rose-400/20' : 'bg-emerald-400/5 border-emerald-400/20'} transition-all`}>
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'Pending' ? 'bg-teacher-primary animate-pulse' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.status === 'Pending' ? 'text-teacher-primary' : 'text-emerald-400'}`}>
                                                    {item.status}
                                                </span >
                                            </div>
                                        </td>
                                        {/* <td className="px-8 py-8 text-right">
                                            <button 
                                                onClick={() => navigate(`/teacher/student-attendance/${item.studentId}`)}
                                                className="p-3.5 rounded-md border border-slate-800 bg-slate-900 text-slate-500 hover:text-white hover:bg-brand-primary hover:border-brand-primary shadow-xl transition-all hover:scale-110 active:scale-90 group"
                                            >
                                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </td> */}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Protocol Note */}
                <div className="relative overflow-hidden bg-slate-900/20 border border-slate-800/40 p-10 rounded-md backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldAlert size={80} />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shrink-0">
                            <AlertCircle className="text-brand-primary" size={20} />
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Institutional Protocol Note</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest max-w-4xl italic">
                                Financial telemetry is read-only for pedagogical staff. For directive modifications or manual synchronization in the administrative registry, please contact the financial administrative node.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassFeeStatus;
