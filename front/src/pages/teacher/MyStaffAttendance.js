import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyStaffAttendance } from '../../redux/slice/teacher.slice';
import { 
    Calendar, CheckCircle, XCircle, Clock, 
    AlertCircle, Activity, Filter
} from 'lucide-react';
import moment from 'moment';

const MyStaffAttendance = () => {
    const dispatch = useDispatch();
    const { myStaffAttendance, loading } = useSelector((state) => state.teacher);

    useEffect(() => {
        dispatch(fetchMyStaffAttendance());
    }, [dispatch]);

    const stats = {
        total: myStaffAttendance?.length || 0,
        present: myStaffAttendance?.filter(a => a.status === 'Present').length || 0,
        late: myStaffAttendance?.filter(a => a.status === 'Late').length || 0,
        absent: myStaffAttendance?.filter(a => a.status === 'Absent').length || 0
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Absent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'Late': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Half-Day': return 'text-teacher-primary bg-teacher-primary/10 border-teacher-primary/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white font-outfit">Staff Attendance Node</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">Personal Presence Vector & Arrival Logs</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Records', val: stats.total, icon: Calendar, color: 'text-teacher-primary', bg: 'bg-teacher-primary/5' },
                    { label: 'Active Signals', val: stats.present, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                    { label: 'Delayed Sync', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5' },
                    { label: 'Signal Loss', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5' },
                ].map((s, i) => (
                    <div key={i} className="bg-brand-surface border border-brand-border/40 rounded-2xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} border border-white/5`}>
                                <s.icon size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                                <p className="text-2xl font-black text-white mt-1 font-outfit">{s.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-brand-surface border border-brand-border/40 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-brand-border/40 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <Activity className="text-teacher-primary" size={20} />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Attendance Ledger</h2>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-background/40">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-brand-border/40">Temporal Marker</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-brand-border/40 text-center">Status Signal</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-brand-border/40">Time Logs</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-brand-border/40 text-right">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/20">
                            {myStaffAttendance?.map((rec) => (
                                <tr key={rec._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-black text-white tracking-tighter uppercase font-outfit mb-0.5">
                                                {moment(rec.date).format('DD MMMM YYYY')}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                                {moment(rec.date).format('dddd')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusColor(rec.status)} shadow-lg shadow-black/20`}>
                                                {rec.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Arrival</span>
                                                <span className="text-xs font-black text-teacher-primary tracking-widest">{rec.arrivalTime || '09:00'}</span>
                                            </div>
                                            <div className="h-8 w-px bg-brand-border/40"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Departure</span>
                                                <span className="text-xs font-black text-slate-400 tracking-widest">{rec.departureTime || '17:00'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <p className="text-[11px] font-black text-slate-500 italic uppercase">
                                            {rec.remarks || '-- Registry Clear --'}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!myStaffAttendance || myStaffAttendance.length === 0) && !loading && (
                    <div className="py-32 text-center border-t border-brand-border/40 bg-brand-background/20">
                        <AlertCircle size={48} className="text-slate-800 mx-auto mb-6 opacity-30 animate-pulse" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No presence signals detected in history ledger</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyStaffAttendance;
