import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    ClipboardList, CheckCircle2, XCircle, Clock, 
    Calendar as CalendarIcon, ShieldAlert, ChevronLeft, 
    ChevronRight, Activity, Layers, AlertCircle, Timer,
    CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import moment from 'moment';

import { fetchDriverAttendanceSlice, markDriverAttendanceSlice } from '../../redux/slice/transport.slice';

const DriverAttendance = () => {
    const dispatch = useDispatch();
    const { driverAttendance, loading } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        dispatch(fetchDriverAttendanceSlice());
        return () => clearInterval(timer);
    }, [dispatch]);

    // Statistics
    const stats = useMemo(() => {
        if (!driverAttendance) return { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
        return {
            total: driverAttendance.length,
            present: driverAttendance.filter(a => a.status === 'Present').length,
            absent: driverAttendance.filter(a => a.status === 'Absent').length,
            late: driverAttendance.filter(a => a.isLate || a.status === 'Late').length,
            leave: driverAttendance.filter(a => a.status === 'Leave' || a.status === 'On Leave').length,
        };
    }, [driverAttendance]);

    const todayRecord = driverAttendance?.find(log => 
        moment(log.date).isSame(moment(), 'day')
    );

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const grid = [];
        for (let i = 0; i < firstDay; i++) {
            grid.push({ day: null, date: null });
        }
        for (let d = 1; d <= days; d++) {
            grid.push({ day: d, date: new Date(year, month, d) });
        }
        return grid;
    }, [currentDate]);

    const attendanceByDate = useMemo(() => {
        const map = {};
        driverAttendance?.forEach(rec => {
            const key = moment(rec.date).format('YYYY-MM-DD');
            map[key] = rec;
        });
        return map;
    }, [driverAttendance]);

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    // Removing manual attendance marking as per new admin-centric flow
    const handleMarkAttendance = () => {
        toast.info('Attendance is now managed by the Transport Administrator. (हाजिरी अब एडमिन द्वारा लगाई जाती है)');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-500';
            case 'Absent': return 'bg-rose-500';
            case 'Late': return 'bg-amber-500';
            case 'Leave': return 'bg-blue-500';
            default: return 'bg-slate-800';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 italic">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500">My Attendance Signal</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Register Presence & View Arrival History (मेरी उपस्थिति)</p>
                </div>
                <div className="flex items-center gap-4 bg-neutral-900/80 border border-slate-800/60 p-2 rounded-md shadow-xl backdrop-blur-3xl">
                    <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-800 rounded-md text-slate-400 transition-all"><ChevronLeft size={16}/></button>
                    <div className="min-w-[140px] text-center">
                        <p className="text-xs font-black text-white uppercase italic tracking-tighter">{moment(currentDate).format('MMMM YYYY')}</p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-800 rounded-md text-slate-400 transition-all"><ChevronRight size={16}/></button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Logs', val: stats.total, icon: CalendarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                    { label: 'Present Days', val: stats.present, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20' },
                    { label: 'Late Syncs', val: stats.late, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20' },
                    { label: 'Absence Count', val: stats.absent, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/5', border: 'border-rose-400/20' },
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`bg-neutral-900 border ${s.border} rounded-md p-6 relative overflow-hidden group hover:border-${s.color.split('-')[1]}-500/40 transition-all`}
                    >
                        <div className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-10 h-10 rounded-md ${s.bg} flex items-center justify-center ${s.color} border border-white/5`}>
                                <s.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{s.label}</p>
                                <p className="text-xl font-black text-white font-outfit tracking-tighter italic">{s.val}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Mark Attendance */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all text-center">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                        </div>
                        
                        <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 leading-none">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 italic">{moment().format('dddd, MMMM DD, YYYY')}</p>

                        <div className="py-8 border-y border-white/5 my-6">
                            <Activity size={48} className="mx-auto text-emerald-500/30 mb-4 animate-pulse" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic max-w-xs mx-auto leading-relaxed">
                                Attendance for the current cycle is now managed by the Transport Administrator. 
                                <br/><span className="text-emerald-500 mt-2 block">(हाजिरी अब एडमिन द्वारा लगाई जाती है)</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/20 p-8 rounded-md italic flex items-start gap-6">
                        <div className="p-3 bg-orange-500 text-black rounded shadow-lg shadow-orange-500/20 flex-shrink-0">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1 leading-none italic">Attendance Policy</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                                Attendance must be marked before 7:30 AM for the morning shift. Late logs will be flagged for review. Ensure you are within the school campus while checking in. (दैनिक उपस्थिति सुबह 7:30 बजे से पहले लगानी अनिवार्य है।)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Calendar Grid */}
                <div className="lg:col-span-2">
                    <div className="bg-neutral-900/60 border border-slate-800/60 rounded-md shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
                        <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <Activity className="text-emerald-500" size={16} />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Temporal Persistence Ledger</h2>
                            </div>
                            <div className="flex gap-4">
                                {['Present', 'Absent', 'Late', 'Leave'].map(st => (
                                    <div key={st} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(st)}`}></div>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{st}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-slate-800/60 bg-neutral-950/40">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-4 text-center text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 relative">
                            {calendarGrid.map((cell, idx) => {
                                const dateKey = cell.date ? moment(cell.date).format('YYYY-MM-DD') : null;
                                const record = dateKey ? attendanceByDate[dateKey] : null;
                                const isToday = cell.date?.toDateString() === new Date().toDateString();

                                return (
                                    <div 
                                        key={idx} 
                                        className={`min-h-[100px] border-r border-b border-slate-800/40 p-3 transition-all hover:bg-white/[0.01] group ${!cell.day ? 'bg-neutral-950/20' : 'relative'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-black italic font-outfit ${isToday ? 'bg-emerald-500 text-black w-6 h-6 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                                {cell.day}
                                            </span>
                                            {record && (
                                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(record.status)}`}></div>
                                            )}
                                        </div>
                                        
                                        {record && (
                                            <div className="space-y-1 mt-auto">
                                                <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${record.status === 'Present' ? 'text-emerald-400 bg-emerald-400/5 border border-emerald-400/20' : record.status === 'Absent' ? 'text-rose-400 bg-rose-400/5' : 'text-amber-400 bg-amber-400/5'}`}>
                                                    {record.status}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-50">
                                                    <Timer size={8} />
                                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{record.arrivalTime || '--:--'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History Table (Minimized) */}
            <div className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-800/40 bg-neutral-950/40">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.25em] flex items-center gap-3">
                        <Layers size={14} className="text-emerald-500" /> Recent Sequence History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left italic">
                        <thead>
                            <tr className="bg-neutral-950/20">
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800/40">Temporal Marker</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800/40 text-center">Protocol Status</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800/40">Log Breakdown</th>
                                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-800/40 text-right">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/20">
                            {driverAttendance?.slice(0, 5).map((log, i) => (
                                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div>
                                            <p className="text-xs font-black text-white tracking-tighter uppercase mb-0.5">{moment(log.date).format('DD MMM YYYY')}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{moment(log.date).format('dddd')}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${log.status === 'Present' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.2em]">Check-In</span>
                                                <span className="text-[9px] font-black text-emerald-500 tracking-widest">{log.arrivalTime || '--:--'}</span>
                                            </div>
                                            <div className="h-6 w-px bg-slate-800/40"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.2em]">Check-Out</span>
                                                <span className="text-[9px] font-black text-slate-500 tracking-widest">{log.departureTime || '--:--'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <p className="text-[10px] font-black text-slate-600 italic uppercase">{log.remarks || 'Electronic Sync Clear'}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverAttendance;
