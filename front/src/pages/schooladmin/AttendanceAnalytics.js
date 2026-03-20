import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchClasses, 
    fetchStandards, 
    fetchAttendanceReport, 
    fetchAttendanceAnalytics, 
    fetchAttendanceAlerts 
} from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, 
    TrendingUp, 
    AlertTriangle, 
    Calendar, 
    Users, 
    Download, 
    Search,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    User
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    LineChart,
    Line
} from 'recharts';

const AttendanceAnalytics = () => {
    const dispatch = useDispatch();
    const { 
        classes, 
        standards, 
        attendanceReport, 
        attendanceAnalytics, 
        attendanceAlerts, 
        loading 
    } = useSelector((s) => s.schoolAdmin);

    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [viewMode, setViewMode] = useState('monthly'); // 'weekly' or 'monthly'
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'alerts', 'reports'
    const [alertView, setAlertView] = useState('grid'); // 'grid' or 'table'

    useEffect(() => {
        dispatch(fetchStandards());
        dispatch(fetchClasses());
        dispatch(fetchAttendanceAnalytics({ type: viewMode }));
        dispatch(fetchAttendanceAlerts({ threshold: 75 }));
    }, [dispatch, viewMode]);

    const handleFetchReport = () => {
        if (selectedClass) {
            dispatch(fetchAttendanceReport({ classSection: selectedClass }));
        }
    };

    const handleExport = () => {
        let dataToExport = [];
        let filename = 'Institutional_Attendance_Intelligence.csv';

        if (activeTab === 'overview') {
            dataToExport = (attendanceAnalytics || []).map(a => ({
                Cycle: viewMode === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][a._id - 1] : `Week ${a._id}`,
                Present: a.present,
                Total: a.total,
                Percentage: (a.total > 0 ? (a.present / a.total) * 100 : 0).toFixed(2) + '%'
            }));
            filename = `Attendance_Trends_${viewMode}.csv`;
        } else if (activeTab === 'alerts') {
            dataToExport = (attendanceAlerts || []).map(a => ({
                Student: `${a.firstName} ${a.lastName}`,
                AdmissionNumber: a.admissionNumber,
                Grade: a.class,
                Percentage: (a.stats?.percentage || 0) + '%',
                Sessions: `${a.stats?.presentCount ?? 0}/${a.stats?.totalCount ?? 0}`
            }));
            filename = 'Critical_Attendance_Anomaly_Alerts.csv';
        } else if (activeTab === 'reports') {
            dataToExport = (attendanceReport || []).map(r => ({
                Student: `${r.firstName} ${r.lastName}`,
                AdmissionNumber: r.admissionNumber,
                AttendanceRate: (r.stats?.percentage || 0) + '%',
                LateLogs: r.stats?.late || 0,
                Status: r.stats?.percentage >= 90 ? 'High Retention' : r.stats?.percentage >= 75 ? 'Nominal' : 'Critical Risk'
            }));
            filename = 'Detailed_Attendance_Telemetry.csv';
        }

        if (dataToExport.length === 0) return alert("No nodes detected for export protocol.");

        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPresent = attendanceAnalytics?.reduce((acc, curr) => acc + curr.present, 0) || 0;
    const totalPossible = attendanceAnalytics?.reduce((acc, curr) => acc + curr.total, 0) || 0;
    const avgAttendance = totalPossible > 0 ? ((totalPresent / totalPossible) * 100).toFixed(1) : '0.0';

    const stats = [
        { 
            label: 'Avg Institution Attendance', 
            value: `${avgAttendance}%`, 
            trend: '+2.1%', 
            icon: TrendingUp, 
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
        { 
            label: 'Critical Alert Nodes', 
            value: attendanceAlerts?.length || 0, 
            trend: '-5', 
            icon: AlertTriangle, 
            color: 'text-rose-400',
            bg: 'bg-rose-400/10'
        },
        { 
            label: 'Total Active Sectors', 
            value: classes?.length || 0, 
            trend: 'Stable', 
            icon: Users, 
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        },
        { 
            label: 'Telemetry Reliability', 
            value: '99.9%', 
            trend: 'Optimal', 
            icon: BarChart3, 
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        }
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header section with futuristic design */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6">
                <div>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit text-shadow-glow">Attendance Intelligence</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl italic">Deep-dive behavioral telemetry and institutional presence analytics terminal.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                    >
                        <Download size={16} /> Export Intelligence
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-slate-950/80 border border-slate-800/80 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[80px] opacity-20 transition-all group-hover:opacity-40`}></div>
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                                <stat.icon size={22} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 ${stat.color} bg-black/20`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">{stat.label}</p>
                        <p className="text-4xl font-black text-white font-outfit italic tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800/60 pb-1 gap-12">
                {[
                    { id: 'overview', label: 'Sector Overview', icon: BarChart3 },
                    { id: 'alerts', label: 'Anomaly Alerts', icon: AlertTriangle },
                    { id: 'reports', label: 'Behavioral Reports', icon: Search }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 pb-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative font-outfit italic ${activeTab === tab.id ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-primary shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Analytics Chart */}
                        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800/80 rounded-[3.5rem] p-10 shadow-2xl overflow-hidden relative">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1 font-outfit">Temporal Trends</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] italic">Attendance stability across active cycles</p>
                                </div>
                                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                                    <button 
                                        onClick={() => setViewMode('weekly')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'weekly' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Weekly
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('monthly')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={attendanceAnalytics?.map(a => ({
                                        ...a,
                                        label: viewMode === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][a._id - 1] : `Week ${a._id}`,
                                        attendanceRate: a.total > 0 ? ((a.present / a.total) * 100).toFixed(1) : 0
                                    })) || []}>
                                        <defs>
                                            <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis 
                                            dataKey="label" 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            tickLine={false} 
                                            axisLine={false} 
                                        />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', color: '#f8fafc' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="attendanceRate" 
                                            name="Presence %" 
                                            stroke="#3b82f6" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorPresence)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity / Sector Performance */}
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-[3.5rem] p-10 shadow-2xl">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 font-outfit">Priority Nodes</h3>
                            <div className="space-y-6">
                                {classes?.slice(0, 5).map((cls, i) => (
                                    <div key={cls._id} className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-900/30 border border-slate-800/40 hover:border-brand-primary/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xs text-brand-primary border border-slate-700 group-hover:scale-110 transition-transform">
                                                {cls.standardId?.level}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white italic uppercase font-outfit">Grade {cls.standardId?.level}-{cls.sectionLabel}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase italic">Sector Active</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-400 font-outfit">94%</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase italic">Reliability</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'alerts' && (
                    <motion.div 
                        key="alerts"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-rose-500/20 blur-md"></div>
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 font-outfit">Critical Anomaly Detection</h3>
                                <p className="text-sm font-medium text-slate-500 italic max-w-xl">Students falling below the institutional 75% engagement threshold. Immediate pedagogical intervention required.</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                {/* <button 
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all mr-2"
                                >
                                    <Download size={14} /> Print Report
                                </button> */}
                                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mr-6">
                                    <button 
                                        onClick={() => setAlertView('grid')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${alertView === 'grid' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Grid
                                    </button>
                                    <button 
                                        onClick={() => setAlertView('table')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${alertView === 'table' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Table
                                    </button>
                                </div>
                                <div className="p-5 bg-rose-500/10 rounded-[2.5rem] border border-rose-500/20 text-rose-500">
                                    <AlertTriangle size={32} />
                                </div>
                            </div>
                        </div>

                        {alertView === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attendanceAlerts?.map((alert, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={alert._id || alert.studentId || i}
                                        className="p-8 rounded-[3rem] bg-slate-900/40 border border-rose-500/20 hover:border-rose-500/50 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 blur-[40px] rounded-full"></div>
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500 overflow-hidden shadow-inner group-hover:border-rose-500/40 transition-all duration-500">
                                                {alert.photo ? (
                                                    <img src={alert.photo} alt={alert.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white italic uppercase font-outfit tracking-tight leading-none mb-1 group-hover:text-rose-400 transition-colors">
                                                    {alert.firstName ? `${alert.firstName} ${alert.lastName}` : (alert.name || 'Anonymous Node')}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{alert.admissionNumber || 'REF: N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Engagement Velocity</span>
                                                <span className="text-2xl font-black text-rose-500 font-outfit">{alert.stats?.percentage || alert.percentage || 0}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-800/50 rounded-full border border-slate-700 overflow-hidden shadow-inner">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${alert.stats?.percentage || alert.percentage || 0}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-600" />
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase italic">
                                                        Nodes: {alert.stats?.presentCount ?? 0} / {alert.stats?.totalCount ?? 0}
                                                    </span>
                                                </div>
                                                <button className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] italic flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Contact Registry <ChevronRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-800 group transition-all">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/60 border-b border-rose-500/20">
                                            {['Anomaly Entity', 'Registry', 'Engagement', 'Timeline Nodes', 'Action'].map(h => (
                                                <th key={h} className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {attendanceAlerts?.map((alert, i) => (
                                            <tr key={alert._id || alert.studentId || i} className="hover:bg-rose-500/[0.03] transition-colors group/row">
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 group-hover/row:border-rose-500/30 transition-all overflow-hidden bg-center bg-cover">
                                                            {alert.photo ? (
                                                                <img src={alert.photo} alt={alert.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={18} />
                                                            )}
                                                        </div>
                                                        <span className="font-black text-white italic uppercase tracking-tight font-outfit">
                                                            {alert.firstName ? `${alert.firstName} ${alert.lastName}` : (alert.name || 'Anonymous Node')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 uppercase">
                                                    <span className="text-[10px] font-black text-slate-500 tracking-widest bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800 italic">#{alert.admissionNumber || 'N/A'}</span>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-rose-500 font-outfit">{alert.stats?.percentage || alert.percentage || 0}%</span>
                                                        <ArrowDownRight size={14} className="text-rose-500" />
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase italic">
                                                        {alert.stats?.presentCount ?? 0} OF {alert.stats?.totalCount ?? 0} SESSIONS
                                                    </span>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <button className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95">
                                                        <Search size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {(!attendanceAlerts || attendanceAlerts.length === 0) && !loading && (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-xl font-black text-white italic uppercase font-outfit tracking-tight">Zero Critical Deviations</h3>
                                <p className="text-sm font-medium text-slate-500 italic mt-2">All student nodes are maintaining nominal engagement thresholds.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'reports' && (
                    <motion.div 
                        key="reports"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Filters */}
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-[3rem] p-10 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 italic">Standard Node</label>
                                    <div className="relative">
                                        <Filter size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <select 
                                            value={selectedStandard} 
                                            onChange={e => { setSelectedStandard(e.target.value); setSelectedClass(''); }}
                                            className="w-full bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all rounded-[1.5rem] py-5 pl-14 pr-8 text-white outline-none cursor-pointer text-sm font-bold font-outfit italic"
                                        >
                                            <option value="">Select Grade</option>
                                            {standards.map(s => <option key={s._id} value={s._id}>Node {s.level}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 italic">Sector Node</label>
                                    <div className="relative">
                                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <select 
                                            value={selectedClass} 
                                            onChange={e => setSelectedClass(e.target.value)} 
                                            disabled={!selectedStandard}
                                            className="w-full bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all rounded-[1.5rem] py-5 pl-14 pr-8 text-white outline-none cursor-pointer text-sm font-bold font-outfit italic disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Sector</option>
                                            {classes
                                                .filter(c => (c.standardId?._id || c.standardId) === selectedStandard)
                                                .map(c => <option key={c._id} value={c._id}>Sector {c.sectionLabel}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleFetchReport}
                                    disabled={!selectedClass}
                                    className="h-[60px] bg-brand-primary hover:bg-blue-600 disabled:opacity-40 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(59,130,246,0.25)] flex items-center justify-center gap-3 font-outfit italic active:scale-95"
                                >
                                    <Search size={18} /> Synchronize Telemetry
                                </button>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-[4rem] overflow-hidden shadow-2xl relative">
                            <div className="p-10 border-b border-slate-800/40 flex items-center justify-between bg-black/20">
                                <div>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1 font-outfit">Detailed Telemetry Log</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] italic">Granular presence tracking for the selected sector</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 italic">
                                        {attendanceReport?.length || 0} Entities Synced
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/40 border-b border-slate-800/50">
                                            {['Student Entity', 'Registry Reference', 'Attendance Score', 'Deviations (Late)', 'Status Terminal'].map(h => (
                                                <th key={h} className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {attendanceReport?.map((report, i) => (
                                            <tr key={report._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                                            {report.photo ? (
                                                                <img src={report.photo} alt={report.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={18} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white italic uppercase font-outfit">{report.firstName} {report.lastName}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1"># {report.admissionNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <span className="text-[11px] font-black text-slate-500 tracking-widest bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50 uppercase font-outfit italic">#{report.admissionNumber}</span>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${report.stats?.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                style={{ width: `${report.stats?.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-black font-outfit ${report.stats?.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>{report.stats?.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className={report.stats?.late > 3 ? 'text-luxury-amber' : 'text-slate-500'} />
                                                        <span className={`text-xs font-bold font-outfit ${report.stats?.late > 3 ? 'text-luxury-amber' : 'text-slate-500'}`}>{report.stats?.late} Logs</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border italic ${report.stats?.percentage >= 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : report.stats?.percentage >= 75 ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                        {report.stats?.percentage >= 90 ? 'High Retention' : report.stats?.percentage >= 75 ? 'Nominal' : 'Critical Risk'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!attendanceReport || attendanceReport.length === 0) && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-32 text-center">
                                                    <Search size={48} className="text-slate-800 mx-auto mb-6 opacity-20" />
                                                    <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[11px] italic font-outfit">No Telemetry Synced. Select Sector to Initiate.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceAnalytics;
