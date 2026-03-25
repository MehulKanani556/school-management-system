import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildAttendance } from '../../redux/slice/parent.slice';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Search, Activity } from 'lucide-react';

const ChildAttendance = () => {
    const dispatch = useDispatch();
    const { selectedChild, attendance, attendanceLoading: loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildAttendance(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    if (loading && attendance.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-40 opacity-50 space-y-4">
                <div className="w-10 h-10 border-2 border-luxury-rose border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Attendance Records...</span>
            </div>
        );
    }

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        late: attendance.filter(a => a.status === 'Late').length,
    };
    const percentage = stats.total > 0 ? (((stats.present) / stats.total) * 100).toFixed(1) : '0.0';

    const statusConfig = {
        'Present': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        'Absent': { icon: XCircle, color: 'text-parent-primary', bg: 'bg-parent-primary/10', border: 'border-parent-primary/20' },
        'Late': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        'Half-Day': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-rose rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-rose">Presence Node</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Attendance Logs</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Historical participation telemetry for <span className="text-white font-bold">{selectedChild?.firstName}</span></p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-black/40 border border-slate-800 p-6 rounded-md shadow-inner backdrop-blur-sm">
                    {[
                        { label: 'Success Rate', val: `${percentage}%`, color: 'text-emerald-400' },
                        { label: 'Present', val: stats.present, color: 'text-emerald-400' },
                        { label: 'Late Logs', val: stats.late, color: 'text-amber-400' },
                        { label: 'Absent', val: stats.absent, color: 'text-parent-primary' },
                    ].map((st, i) => (
                        <div key={i} className="flex flex-col items-center px-6 border-r border-slate-800 last:border-0 min-w-[100px]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{st.label}</p>
                            <p className={`text-2xl font-black ${st.color}`}>{st.val}</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-brand-border/40 flex items-center justify-between bg-black/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Chronological Sequence</h3>
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-luxury-rose transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Filter Cycles..." 
                                className="bg-slate-900 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-luxury-rose/50 transition-all w-48"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Subject / Room</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/20">
                                {attendance.length > 0 ? (
                                    attendance.map((record, idx) => {
                                        const config = statusConfig[record.status] || statusConfig['Absent'];
                                        const Icon = config.icon;
                                        return (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-slate-900 rounded-md group-hover:bg-slate-800 transition-colors">
                                                            <Calendar size={18} className="text-slate-400" />
                                                        </div>
                                                        <span className="font-bold text-slate-200 tracking-tight">{new Date(record.date).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                                                        <Icon size={14} />
                                                        {record.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{record.subjectId?.name || "General Session"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Registry Sync confirmed</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <Activity size={48} className="mx-auto mb-4 text-slate-700 animate-pulse" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Attendance Records Indexed</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChildAttendance;
