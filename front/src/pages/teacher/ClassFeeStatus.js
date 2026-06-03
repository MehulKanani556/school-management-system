import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeeStatus, fetchAssignedClasses } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, AlertCircle, CheckCircle2, DollarSign, Users, ArrowRight, TrendingUp, ShieldAlert, CreditCard, Activity, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ClassFeeStatus = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { feeStatus, loading, classes } = useSelector((s) => s.teacher);
    const { activeAcademicYearId } = useSelector((s) => s.academicYear || {});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchFeeStatus({ classId: selectedClass }));
    }, [dispatch, selectedClass, activeAcademicYearId]);

    // Reset selected class and page on academic year change
    useEffect(() => {
        setSelectedClass('all');
        setCurrentPage(1);
    }, [activeAcademicYearId]);

    // Reset to page 1 on filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, selectedClass]);

    const stats = {
        total: feeStatus.length,
        pending: feeStatus.filter(s => s.status === 'Pending').length,
        cleared: feeStatus.filter(s => s.status === 'Cleared').length,
        totalPendingAmount: feeStatus.reduce((acc, s) => acc + (s.totalPending || 0), 0)
    };

    const filteredStatus = feeStatus.filter(s => {
        const nameVal = s.name || '';
        const admVal = s.admissionNumber || '';
        const matchesSearch = nameVal.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             admVal.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredStatus.length / itemsPerPage);
    const currentItems = filteredStatus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                                Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-400">Fee Status</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 max-w-xl">
                            <Activity size={12} className="text-brand-primary animate-pulse" />
                            View fee status and pending dues for your assigned classes.
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
                                <option value="all">ALL CLASSES</option>
                                {classes?.map(c => (
                                    <option key={c._id} value={c._id}>
                                        CLASS: {c.standardId?.level || c.gradeLevel}-{c.sectionLabel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            onClick={() => toast.success('Report exporting...')}
                            className="flex items-center gap-3 px-8 py-5 bg-slate-900 hover:bg-brand-primary text-slate-300 hover:text-white rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-slate-800 hover:border-brand-primary/50 shadow-2xl group active:scale-95"
                        >
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> 
                            Export Report
                        </button>
                    </div>
                </div>
            </header>

            {/* Metric Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: stats.total, icon: Users, color: 'text-blue-400', glow: 'shadow-blue-500/10', border: 'border-blue-500/20' },
                    { label: 'Students with Dues', value: stats.pending, icon: ShieldAlert, color: 'text-teacher-primary', glow: 'shadow-rose-500/10', border: 'border-rose-500/20' },
                    { label: 'Paid Students', value: stats.cleared, icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Total Pending Dues', value: `₹${(stats.totalPendingAmount || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-amber-400', glow: 'shadow-amber-500/10', border: 'border-amber-500/20' },
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
                            placeholder="SEARCH STUDENT NAME OR ADMISSION NUMBER..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800/80 p-5 pl-14 rounded-md focus:border-brand-primary/50 focus:bg-slate-900 outline-none text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 placeholder:text-slate-600 shadow-xl" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {[
                            { filter: 'All', label: 'All' },
                            { filter: 'Pending', label: 'Pending' },
                            { filter: 'Cleared', label: 'Paid' }
                        ].map(item => (
                            <button 
                                key={item.filter}
                                onClick={() => setStatusFilter(item.filter)}
                                className={`px-6 py-4 rounded-md border text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${statusFilter === item.filter ? 'bg-brand-primary border-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-brand-primary/40'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded-md overflow-hidden backdrop-blur-3xl shadow-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-800">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Student Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit text-center">Class</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Pending Amount</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-outfit">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-primary rounded-full animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 animate-pulse">Loading fee data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 py-12 opacity-40">
                                                <Search size={40} className="text-slate-600 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">No students found matching current filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentItems.map((item, i) => (
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
                                                            <img src={item.photo} alt={item.name || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="uppercase">
                                                                {(item.name || '').split(' ').map(p => p ? p[0] : '').slice(0, 2).join('')}
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
                                                    ₹{(item.totalPending || 0).toLocaleString()}
                                                </p>
                                                {item.totalPending > 0 && <span className="text-[8px] font-black uppercase text-rose-400/50 tracking-widest italic">Action Required</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-md border ${item.status === 'Pending' ? 'bg-rose-400/5 border-rose-400/20' : 'bg-emerald-400/5 border-emerald-400/20'} transition-all`}>
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'Pending' ? 'bg-teacher-primary animate-pulse' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.status === 'Pending' ? 'text-teacher-primary' : 'text-emerald-400'}`}>
                                                    {item.status === 'Pending' ? 'Pending' : 'Paid'}
                                                </span >
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 p-6 rounded-md backdrop-blur-md">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">
                            Page {currentPage} of {totalPages} ({filteredStatus.length} total students)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-3 rounded-md border transition-all ${currentPage === 1 ? 'border-slate-800/80 text-slate-700 cursor-not-allowed bg-slate-950/20' : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-brand-primary hover:bg-slate-800'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                                        if (pageNum === 2 || pageNum === totalPages - 1) {
                                            return <span key={pageNum} className="text-slate-600 px-1">...</span>;
                                        }
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-9 h-9 rounded-md text-[10px] font-black transition-all font-outfit ${currentPage === pageNum ? 'bg-brand-primary/20 border border-brand-primary text-brand-primary' : 'border border-slate-800/80 bg-slate-950/20 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-3 rounded-md border transition-all ${currentPage === totalPages ? 'border-slate-800/80 text-slate-700 cursor-not-allowed bg-slate-950/20' : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-brand-primary hover:bg-slate-800'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Important Note */}
                <div className="relative overflow-hidden bg-slate-900/20 border border-slate-800/40 p-10 rounded-md backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldAlert size={80} />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shrink-0">
                            <AlertCircle className="text-brand-primary" size={20} />
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Important Note</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest max-w-4xl italic">
                                This page is read-only. For any payment updates or changes, please contact the Admin or Accountant.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassFeeStatus;
