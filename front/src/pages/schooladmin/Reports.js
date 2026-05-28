import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchoolPerformance, fetchFeeReport, exportFeeReport, exportAttendanceReport, fetchClasses } from '../../redux/slice/schoolAdmin.slice';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, PieChart, Download, Users, 
  CreditCard, GraduationCap, ChevronRight, FileText, 
  ArrowUpRight, ArrowDownRight, Printer, Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, AreaChart, Area, 
  PieChart as RePieChart, Pie
} from 'recharts';

const Reports = () => {
    const dispatch = useDispatch();
    const { schoolPerformance, feeReport, classes, loading } = useSelector(state => state.schoolAdmin);
    const { activeAcademicYearId, activeAcademicYear } = useSelector(state => state.academicYear);
    const [activeTab, setActiveTab] = useState('performance');

    useEffect(() => {
        if (activeAcademicYearId) {
            dispatch(fetchSchoolPerformance({ academicYearId: activeAcademicYearId }));
            dispatch(fetchFeeReport({ academicYearId: activeAcademicYearId }));
            dispatch(fetchClasses({ academicYearId: activeAcademicYearId }));
        }
    }, [dispatch, activeAcademicYearId]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black font-outfit tracking-tight text-white uppercase italic">
                        School <span className="text-brand-primary">Reports</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-1">Overview of academic results, finances, and attendance</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* <button 
                        onClick={() => window.print()}
                        className="p-3 bg-slate-900/50 border border-white/5 rounded-md text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <Printer size={18} />
                    </button> */}
                    {/* <div className="h-10 w-px bg-white/5 hidden md:block mx-2"></div> */}
                    <div className="flex bg-slate-900/50 p-1 rounded-md border border-white/5">
                        {['performance', 'finances'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && !schoolPerformance && (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-md animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Loading report data...</p>
                </div>
            )}

            {!loading && activeTab === 'performance' && schoolPerformance && (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Multi-Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Overall Pass Rate', val: `${schoolPerformance.passRate}%`, icon: TrendingUp, color: 'text-emerald-400', trend: '+2.4%', up: true },
                            { label: 'School Average Marks', val: `${schoolPerformance.overallAverage}%`, icon: GraduationCap, color: 'text-brand-primary', trend: '+1.1%', up: true },
                            { label: 'Published Exams', val: schoolPerformance.totalExams, icon: FileText, color: 'text-amber-400', trend: 'Stable', up: null },
                            { label: 'Student Coverage', val: '100%', icon: Users, color: 'text-indigo-400', trend: 'Optimal', up: null },
                        ].map((m, i) => (
                            <motion.div key={i} variants={itemVariants} className="bg-brand-surface/40 backdrop-blur-md border border-white/5 rounded-md p-6 group hover:border-brand-primary/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-md bg-white/5 ${m.color}`}>
                                        <m.icon size={20} />
                                    </div>
                                    {m.up !== null && (
                                        <div className={`flex items-center gap-1 text-[9px] font-black ${m.up ? 'text-emerald-400' : 'text-schooladmin-primary'}`}>
                                            {m.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {m.trend}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
                                <h3 className="text-2xl font-black text-white font-outfit mt-1">{m.val}</h3>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Subject Comparison */}
                        <div className="bg-brand-surface/40 backdrop-blur-md border border-white/5 rounded-md p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                    <BarChart3 size={16} /> Subject Wise Average Marks
                                </h3>
                                <div className="p-2 bg-white/5 rounded-md text-slate-500 cursor-help hover:text-white transition-colors">
                                    <Filter size={14} />
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={schoolPerformance.subjectChart || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '12px' }}
                                        />
                                        <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={35}>
                                            {schoolPerformance.subjectChart?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#3b82f6'} fillOpacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grade Wise Distribution */}
                        <div className="bg-brand-surface/40 backdrop-blur-md border border-white/5 rounded-md p-8">
                             <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                    <TrendingUp size={16} /> Grade Wise Average Marks
                                </h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={schoolPerformance.gradeChart || []}>
                                        <defs>
                                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}
                                        />
                                        <Area type="monotone" dataKey="average" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {!loading && activeTab === 'finances' && feeReport && (
                 <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/40 border border-emerald-500/10 rounded-md p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-md bg-emerald-500/10 text-emerald-400">
                                    <CreditCard size={24} />
                                </div>
                                <div className="px-3 py-1 rounded-md bg-emerald-500/10 text-[9px] font-black text-emerald-400 uppercase tracking-widest">Fees Collected</div>
                            </div>
                            <h2 className="text-4xl font-black text-white font-outfit">₹{feeReport.totalCollected.toLocaleString()}</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Received Payments</p>
                            <div className="mt-8 h-2 w-full bg-slate-800 rounded-md overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${feeReport.collectionRate}%` }}></div>
                            </div>
                            <p className="text-[9px] font-black text-emerald-400 mt-2 uppercase tracking-widest">{feeReport.collectionRate}% of Target Reached</p>
                        </div>

                        <div className="bg-slate-900/40 border border-schooladmin-primary/10 rounded-md p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-md bg-schooladmin-primary/10 text-schooladmin-primary">
                                    <ArrowDownRight size={24} />
                                </div>
                                <div className="px-3 py-1 rounded-md bg-schooladmin-primary/10 text-[9px] font-black text-schooladmin-primary uppercase tracking-widest">Outstanding Fees</div>
                            </div>
                            <h2 className="text-4xl font-black text-white font-outfit">₹{feeReport.totalOutstanding.toLocaleString()}</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Pending Payments</p>
                            <button 
                                onClick={() => dispatch(exportFeeReport({ academicYearId: activeAcademicYearId }))}
                                className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md flex items-center justify-center gap-3 transition-all active:scale-95 group text-slate-400 hover:text-white"
                            >
                                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Download Pending Fees List</span>
                            </button>
                        </div>

                        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-md p-8 flex flex-col justify-center text-center relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <PieChart size={120} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2">Total Expected Fees</p>
                            <h2 className="text-5xl font-black text-white font-outfit">₹{feeReport.totalExpected.toLocaleString()}</h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">Fiscal Year {activeAcademicYear?.name || '2025-26'}</p>
                        </div>
                    </div>

                    {/* Attendance Export Section */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-md p-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-white font-outfit uppercase italic tracking-tight">Attendance Records & <span className="text-brand-primary">Exports</span></h3>
                            <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-lg">
                                Download complete attendance reports to view or print student presence records.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                              <button 
                                onClick={() => dispatch(exportAttendanceReport({ academicYearId: activeAcademicYearId }))}
                                className="px-8 py-5 bg-brand-primary text-white rounded-md font-black text-[11px] uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center gap-3"
                            >
                                <FileText size={18} />
                                Download Attendance CSV
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {!loading && !schoolPerformance && !feeReport && (
                <div className="py-20 text-center bg-slate-900/30 rounded-md border border-dashed border-white/10">
                    <BarChart3 size={48} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No report data available yet</p>
                </div>
            )}
        </div>
    );
};

export default Reports;
