import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDetailedAttendance, fetchStudentDetail } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, Clock, CalendarDays, TrendingUp, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDetailedAttendance = () => {
    const { studentId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { detailedAttendance: history, studentDetail: student, loading } = useSelector((s) => s.teacher);

    useEffect(() => {
        dispatch(fetchDetailedAttendance(studentId));
        dispatch(fetchStudentDetail(studentId));
    }, [dispatch, studentId]);

    const stats = {
        total: history.length,
        present: history.filter(r => r.status === 'Present').length,
        absent: history.filter(r => r.status === 'Absent').length,
        late: history.filter(r => r.status === 'Late').length,
        percentage: history.length > 0 ? ((history.filter(r => r.status === 'Present').length / history.length) * 100).toFixed(1) : 0
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Absent': return 'text-teacher-primary bg-teacher-primary/10 border-teacher-primary/20';
            case 'Late': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex items-center gap-6 pb-2 border-b border-white/5">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-md text-slate-400 hover:text-white transition-all hover:bg-slate-700"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit shadow-text-glow">Attendance Archival</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide flex items-center gap-2 italic">
                        <TrendingUp size={14} className="text-brand-primary" />
                        Comprehensive telemetry log for {student ? `${student.firstName} ${student.lastName}` : 'Identity node'}.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Cycles', value: stats.total, icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Present Ratio', value: `${stats.percentage}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Absent Alarms', value: stats.absent, icon: XCircle, color: 'text-teacher-primary', bg: 'bg-teacher-primary/10' },
                    { label: 'Late Synchronizations', value: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-slate-800/40 border border-slate-700/30 p-6 rounded-md hover:border-slate-600 transition-all group shadow-xl"
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
                <div className="p-6 border-b border-slate-800/80 bg-slate-800/20">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic font-outfit">Temporal Logs Matrix</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Calendar Cycle</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Synchronization Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">Diagnostic Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center italic text-slate-600 font-bold uppercase tracking-widest animate-pulse">Retrieving historical telemetry archival records...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center italic text-slate-600 font-bold uppercase tracking-widest opacity-50">No temporal history found for this identity node</td>
                                </tr>
                            ) : history.map((item, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    key={i} 
                                    className="hover:bg-slate-800/30 transition-all group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <CalendarDays size={16} className="text-brand-primary opacity-40" />
                                            <span className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit">
                                                {format(parseISO(item.date), 'EEEE, do MMMM yyyy')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-slate-500 font-medium italic">
                                            {item.remarks || 'No behavioral anomalies recorded during this cycle.'}
                                        </p>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-md flex items-start gap-4 italic shadow-2xl">
                <AlertCircle className="text-brand-primary shrink-0" size={20} />
                <p className="text-[11px] text-slate-400/80 leading-relaxed font-bold uppercase tracking-wide">
                    Institutional Note: Temporal data is synchronized daily at the conclusion of pedagogical cycles. Historical accuracy is maintained through the primary class teacher's authorized credentials.
                </p>
            </div>
        </div>
    );
};

export default StudentDetailedAttendance;
