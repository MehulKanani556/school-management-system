import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAttendance } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Search, ChevronRight } from 'lucide-react';

const AttendanceHistory = () => {
    const dispatch = useDispatch();
    const { attendance, loading } = useSelector((state) => state.student);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchStudentAttendance());
    }, [dispatch]);

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        late: attendance.filter(a => a.status === 'Late').length,
    };
    const percentage = stats.total > 0 ? (((stats.present) / stats.total) * 100).toFixed(1) : '0.0';

    const filtered = attendance.filter(a => {
        const q = search.toLowerCase();
        return (
            new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase().includes(q) ||
            (a.status || '').toLowerCase().includes(q)
        );
    });

    const statusConfig = {
        'Present': { icon: CheckCircle, color: 'text-luxury-emerald', bg: 'bg-luxury-emerald/10', border: 'border-luxury-emerald/20' },
        'Absent': { icon: XCircle, color: 'text-luxury-rose', bg: 'bg-luxury-rose/10', border: 'border-luxury-rose/20' },
        'Late': { icon: Clock, color: 'text-luxury-amber', bg: 'bg-luxury-amber/10', border: 'border-luxury-amber/20' },
        'Half-Day': { icon: Clock, color: 'text-luxury-blue', bg: 'bg-luxury-blue/10', border: 'border-luxury-blue/20' },
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl group font-outfit">
                <div className="space-y-2 font-outfit">
                    <div className="flex items-center gap-3 mb-2 font-outfit">
                        <span className="w-12 h-[2px] bg-luxury-emerald rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-emerald">Attendance Status</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none text-shadow-glow">Attendance Records</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic leading-none">View your daily school attendance and punctuality records.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-black/40 border border-slate-800/80 p-6 rounded-md shadow-inner backdrop-blur-sm font-outfit">
                    {[
                        { label: 'Attendance %', val: `${percentage}%`, color: 'text-luxury-emerald' },
                        { label: 'Present', val: stats.present, color: 'text-luxury-emerald' },
                        { label: 'Late Arrivals', val: stats.late, color: 'text-luxury-amber' },
                        { label: 'Absent', val: stats.absent, color: 'text-luxury-rose' },
                    ].map((st, i) => (
                        <div key={i} className="flex flex-col items-center px-6 border-r border-slate-800/40 last:border-0 min-w-[100px] font-outfit">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{st.label}</p>
                            <p className={`text-2xl font-black ${st.color} italic`}>{st.val}</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 font-outfit">
                <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl font-outfit">
                    <div className="p-8 border-b border-slate-800/50 flex items-center justify-between bg-black/20 font-outfit">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Attendance History</h3>
                        <div className="relative group font-outfit">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-luxury-emerald transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search by date or status..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-slate-900/50 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-luxury-emerald/50 transition-all w-48 h-[36px] italic"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto font-outfit">
                        <table className="w-full text-left border-collapse font-outfit">
                            <thead>
                                <tr className="bg-slate-900/30">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Timing (In / Out)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 font-outfit">
                                {filtered.length > 0 ? (
                                    filtered.map((record, idx) => {
                                        const config = statusConfig[record.status] || statusConfig['Absent'];
                                        const Icon = config.icon;
                                        return (
                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors group font-outfit">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-slate-900 rounded-md group-hover:bg-slate-800 transition-colors">
                                                            <Calendar size={18} className="text-slate-400" />
                                                        </div>
                                                        <span className="font-bold text-slate-200 tracking-tight">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest italic ${config.bg} ${config.color} border ${config.border}`}>
                                                        <Icon size={14} />
                                                        {record.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-400 uppercase italic leading-none">{record.arrivalTime || '—'}</span>
                                                        <ChevronRight size={10} className="text-slate-700" />
                                                        <span className="text-xs font-bold text-slate-400 uppercase italic leading-none">{record.departureTime || '—'}</span>
                                                    </div>
                                                </td>
                                                
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center font-outfit">
                                            <div className="opacity-20 mb-4 inline-block font-outfit"><Calendar size={48} /></div>
                                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">
                                                {search ? 'No records match your filter' : 'No attendance records found for this period.'}
                                            </p>
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

export default AttendanceHistory;
