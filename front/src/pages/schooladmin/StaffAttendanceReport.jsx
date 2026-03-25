import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStaffMonthlySummary, fetchStaffAttendance, exportStaffAttendance } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Users, CheckCircle, XCircle, Clock, Download, 
    Search, Filter, ChevronLeft, ChevronRight, FileSpreadsheet,
    TrendingUp, Award, CalendarDays, PieChart, AlertCircle
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const StaffAttendanceReport = () => {
    const dispatch = useDispatch();
    const { staffMonthlySummary, loading, staffAttendance } = useSelector((state) => state.schoolAdmin);
    const [month, setMonth] = useState(moment().month() + 1);
    const [year, setYear] = useState(moment().year());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchStaffMonthlySummary({ month, year }));
    }, [dispatch, month, year]);

    const handleExport = () => {
        dispatch(exportStaffAttendance({ month, year }));
        toast.success('Workforce Analytical Export Commenced');
    };

    const filteredSummary = staffMonthlySummary.filter(s => {
        const staffObj = s.teacher || s.user;
        const name = `${staffObj?.firstName} ${staffObj?.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-8 font-inter">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-3xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-schooladmin-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Registry Analytics</h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] ml-5 italic opacity-80">Chronological intelligence report for institutional workforce</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-400 outline-none px-4 py-2 cursor-pointer hover:text-schooladmin-primary transition-colors"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1} className="bg-slate-900">{m}</option>
                            ))}
                        </select>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-400 outline-none px-4 py-2 cursor-pointer border-l border-white/5 hover:text-schooladmin-primary transition-colors"
                        >
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="bg-slate-900">{y}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 group"
                    >
                        <FileSpreadsheet size={16} className="group-hover:rotate-12 transition-transform" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* High-Level Analytical Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Workforce Efficiency', val: '94.2%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/5', desc: 'Average Presence Rate' },
                    { label: 'Critical Deviations', val: '12', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/5', desc: 'Unnotified Absences' },
                    { label: 'Top Performer', val: 'K. Sharma', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/5', desc: '100% Monthly Uptime' },
                    { label: 'Active Personnel', val: filteredSummary.length, icon: Users, color: 'text-schooladmin-primary', bg: 'bg-schooladmin-primary/5', desc: 'Synchronized Nodes' },
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-schooladmin-primary/30 transition-all duration-500"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${s.bg} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl ${s.bg} border border-white/5 flex items-center justify-center ${s.color} mb-6 shadow-inner group-hover:rotate-6 transition-transform`}>
                                <s.icon size={26} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">{s.label}</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-black text-white tracking-tighter uppercase">{s.val}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-600 italic">{s.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Monthly Cards Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 max-w-md bg-slate-900/50 p-1 rounded-2xl border border-white/5 shadow-inner">
                        <Search size={18} className="ml-4 text-slate-600" />
                        <input 
                            type="text" 
                            placeholder="Filter personnel by identity hash..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-700 font-bold"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-white/5">
                            <Clock size={12} className="text-schooladmin-primary" />
                            Live Telemetry Active
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredSummary.map((staff, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={staff._id} 
                                className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.02] transition-colors border-l-4 border-l-blue-500 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-schooladmin-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-schooladmin-primary/10 transition-colors"></div>
                                
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center font-black text-schooladmin-primary border border-white/10 shadow-lg text-xl group-hover:scale-110 transition-transform">
                                            {(staff.teacher?.firstName || staff.user?.firstName)?.[0]}
                                        </div>
                                        <div>
                                            <Link to={`/school-admin/profile/${staff.teacher?._id || staff.user?._id}`} className="block">
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight italic hover:text-schooladmin-primary transition-colors cursor-pointer">
                                                    {staff.teacher ? `${staff.teacher.firstName} ${staff.teacher.lastName}` : `${staff.user?.firstName} ${staff.user?.lastName}`}
                                                </h3>
                                            </Link>
                                            <p className="text-[10px] font-black text-slate-600 font-mono tracking-widest mt-1 uppercase">
                                                ID: {staff.teacher?.employeeId || `${staff.user?.role}-${staff.user?._id?.slice(-4)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <PieChart size={20} className="text-slate-800" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-emerald-500/20 transition-all">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Present</p>
                                        <p className="text-xl font-black text-emerald-400 font-mono">{staff.present}d</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-rose-500/20 transition-all">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Absent</p>
                                        <p className="text-xl font-black text-rose-400 font-mono">{staff.absent}d</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-amber-500/20 transition-all">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Half-Day</p>
                                        <p className="text-xl font-black text-amber-400 font-mono">{staff.halfDay}d</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 shadow-inner group-hover:border-schooladmin-primary/20 transition-all">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Leave</p>
                                        <p className="text-xl font-black text-schooladmin-primary font-mono">{staff.leave}d</p>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Uptime Efficiency</p>
                                        <p className="text-[10px] font-black text-white font-mono">{Math.round((staff.present / (staff.present + staff.absent + staff.halfDay + staff.leave || 1)) * 100)}%</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(staff.present / (staff.present + staff.absent + staff.halfDay + staff.leave || 1)) * 100}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-schooladmin-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        ></motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredSummary.length === 0 && !loading && (
                    <div className="py-24 text-center bg-slate-900/20 rounded-[2rem] border border-dashed border-white/10">
                        <CalendarDays size={64} className="mx-auto text-slate-800 mb-6 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest italic">Temporal Data Vacuum</h3>
                        <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest mt-2">No workforce signals detected for the selected chronon</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffAttendanceReport;
