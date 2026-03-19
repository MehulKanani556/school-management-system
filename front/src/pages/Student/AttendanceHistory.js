import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAttendance } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Search } from 'lucide-react';

const AttendanceHistory = () => {
    const dispatch = useDispatch();
    const { attendance, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentAttendance());
    }, [dispatch]);

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        late: attendance.filter(a => a.status === 'Late').length,
    };
    const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Presence Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Attendance telemetry & participation logs.</p>
                </div>
                <div className="bg-[#0f0f12] border border-slate-800 p-6 rounded-[2rem] flex items-center gap-8 shadow-2xl">
                   <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Success Rate</p>
                        <p className="text-2xl font-black text-luxury-emerald italic font-outfit">{percentage}%</p>
                   </div>
                   <div className="w-px h-10 bg-slate-800"></div>
                   <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Cycles</p>
                        <p className="text-2xl font-black text-white italic font-outfit">{stats.total}</p>
                   </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-800/50 flex items-center justify-between bg-black/20">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Historical Logs</h3>
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-luxury-emerald transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Filter Cycles..." 
                                className="bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-12 pr-4 text-[10px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-luxury-emerald/50 transition-all w-48"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/30">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Date Node</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Institutional Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {attendance.length > 0 ? (
                                    attendance.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-slate-800 transition-colors">
                                                        <Calendar size={18} className="text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-slate-200 tracking-tight">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                    record.status === 'Present' ? 'bg-luxury-emerald/10 text-luxury-emerald border border-luxury-emerald/20' :
                                                    record.status === 'Absent' ? 'bg-luxury-rose/10 text-luxury-rose border border-luxury-rose/20' :
                                                    'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20'
                                                }`}>
                                                    {record.status === 'Present' ? <CheckCircle size={14} /> : 
                                                     record.status === 'Absent' ? <XCircle size={14} /> : <Clock size={14} />}
                                                    {record.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">System Confirmed</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <div className="opacity-20 mb-4 inline-block"><Calendar size={48} /></div>
                                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-[10px]">No Attendance Records Found in this Sector</p>
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
