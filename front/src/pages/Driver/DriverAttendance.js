import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    ClipboardList, CheckCircle2, XCircle, Clock, 
    Calendar as CalendarIcon, ShieldAlert, ChevronLeft, 
    ChevronRight, Activity, Layers, AlertCircle, Timer,
    CheckSquare, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import moment from 'moment';

import { fetchDriverAttendanceSlice, markDriverAttendanceSlice, clearTransportMessage } from '../../redux/slice/transport.slice';

const DriverAttendance = () => {
    const dispatch = useDispatch();
    const { driverAttendance: attendance, loading, message, error } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);
    
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
        dispatch(fetchDriverAttendanceSlice({ 
            startDate: startOfMonth, 
            endDate: endOfMonth 
        }));
    }, [currentMonth, dispatch]);

    // Cleanup message/error
    useEffect(() => {
        if (message || error) {
            if (error) toast.error(error);
            // message is handled by slice standard toasts usually, but we can add manual if needed
            const timer = setTimeout(() => dispatch(clearTransportMessage()), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error, dispatch]);

    const stats = useMemo(() => {
        const total = attendance?.length || 0;
        const present = attendance?.filter(a => ['Present', 'On-Time'].includes(a.status)).length || 0;
        const absent = attendance?.filter(a => a.status === 'Absent' || a.status === 'On Leave').length || 0;
        const late = attendance?.filter(a => a.isLate || a.status === 'Late').length || 0;
        const percentage = total > 0 ? (((present + late) / total) * 100).toFixed(1) : '0.0';
        return { total, present, absent, late, percentage };
    }, [attendance]);

    const statusConfig = {
        'Present': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', shadow: 'shadow-emerald-500/20' },
        'Absent': { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20' },
        'Late': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', shadow: 'shadow-amber-500/20' },
        'On Leave': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'shadow-blue-500/20' },
        'Holiday': { icon: CalendarIcon, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', shadow: 'shadow-slate-500/20' },
    };

    const calendarGrid = useMemo(() => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const endOfMonth = currentMonth.clone().endOf('month');
        const startDay = startOfMonth.day();
        const daysInMonth = currentMonth.daysInMonth();
        
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startDay) {
                    week.push(null);
                } else if (day <= daysInMonth) {
                    week.push(startOfMonth.clone().date(day));
                    day++;
                } else {
                    week.push(null);
                }
            }
            if (week.some(d => d !== null)) grid.push(week);
        }
        return grid;
    }, [currentMonth]);

    const handleMarkAttendance = () => {
        dispatch(markDriverAttendanceSlice({ status: 'Present', remarks: 'Self Registered' }))
            .unwrap()
            .then(() => toast.success('Duty Attendance Registered!'))
            .catch(err => toast.error(err || 'Registration failed'));
    };

    const isTodayMarked = useMemo(() => {
        return attendance?.some(log => moment(log.date).isSame(moment(), 'day'));
    }, [attendance]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10 font-outfit">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 bg-slate-900/40 p-12 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-16 h-[2px] bg-emerald-500 rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 font-outfit">Duty Terminal</span>
                    </div>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">My Attendance</h1>
                    <div className="flex items-center gap-4 py-2 px-6 bg-white/[0.03] rounded-2xl border border-white/5 w-fit group hover:border-emerald-500/30 transition-all duration-500">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <p className="text-slate-500 font-bold text-sm tracking-wide italic leading-none">Register your daily duty check-in here <span className="text-white font-black group-hover:text-emerald-500 transition-colors capitalize">(मेरी दैनिक उपस्थिति)</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Signal Ratio', val: `${stats.percentage}%`, color: 'text-emerald-400' },
                        { label: 'Active Days', val: stats.present, color: 'text-emerald-400' },
                        { label: 'Late Syncs', val: stats.late, color: 'text-amber-400' },
                        { label: 'Absence', val: stats.absent, color: 'text-rose-500' },
                    ].map((st, i) => (
                        <div key={i} className="flex flex-col items-center justify-center px-10 py-6 bg-slate-950/40 border border-white/5 rounded-2xl shadow-2xl group transition-all duration-500 hover:border-white/10 min-w-[140px]">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2 font-outfit">{st.label}</p>
                            <p className={`text-4xl font-black italic tracking-tighter ${st.color}`}>{st.val}</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Registration Widget */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all text-center backdrop-blur-3xl ring-1 ring-white/10">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                        </div>
                        
                        <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 leading-none font-outfit">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 italic">{moment().format('dddd, MMMM DD, YYYY')}</p>

                        <div className="py-8 border-y border-white/5 my-6">
                            {isTodayMarked ? (
                                <div className="space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-2xl">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic">Duty Log Synced</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">(आज की हाजिरी दर्ज है)</p>
                                    </div>
                                </div>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMarkAttendance}
                                    disabled={loading}
                                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Activity size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                                    Mark Presence
                                </motion.button>
                            )}
                        </div>
                        
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4 italic leading-relaxed">
                            Terminal status: <span className="text-emerald-500">Live & Connected</span>
                        </p>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/20 p-8 rounded-3xl italic flex items-start gap-6 ring-1 ring-orange-500/10">
                        <div className="p-3 bg-orange-500 text-black rounded-xl shadow-lg shadow-orange-500/20 flex-shrink-0">
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

                {/* Calendar View */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-2xl ring-1 ring-white/10">
                        <div className="flex items-center justify-between mb-16">
                            <div className="flex items-center gap-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 group hover:scale-105 transition-all duration-700">
                                    <CalendarIcon size={48} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none font-outfit">{currentMonth.format('MMMM YYYY')}</h2>
                                    <div className="flex items-center gap-4">
                                        <span className="w-10 h-[1px] bg-slate-700"></span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-outfit">Operational Presence Matrix</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-3xl border border-white/10 shadow-3xl backdrop-blur-2xl">
                                <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-5 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group"><ChevronLeft size={28} className="group-active:-translate-x-1 transition-transform" /></button>
                                <button onClick={() => setCurrentMonth(moment())} className="px-12 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-white transition-all tracking-[0.4em] font-outfit border border-white/5">Sync Today</button>
                                <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-5 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group"><ChevronRight size={28} className="group-active:translate-x-1 transition-transform" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-10">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 pb-4 font-outfit border-b border-white/5 mb-6">{d}</div>
                            ))}
                            {calendarGrid.flat().map((date, i) => {
                                if (!date) return <div key={i} className="aspect-square opacity-0 pointer-events-none" />;
                                
                                const isToday = date.isSame(moment(), 'day');
                                const record = attendance?.find(a => moment(a.date).isSame(date, 'day'));
                                const config = record ? statusConfig[record.status] : null;
                                const Icon = config?.icon || Activity;

                                return (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ scale: 1.05, y: -8 }}
                                        onClick={() => record && setSelectedDate(record)}
                                        className={`relative aspect-square rounded-3xl p-10 cursor-pointer transition-all duration-700 group border flex flex-col items-center justify-center overflow-hidden font-outfit ${isToday ? 'bg-emerald-500/10 border-emerald-500/40 shadow-2xl shadow-emerald-500/10' : 'bg-slate-950/20 border-white/5 hover:border-white/20'}`}
                                    >
                                        <span className={`absolute top-8 left-10 text-8xl font-black tracking-tighter transition-all duration-700 ${isToday ? 'text-emerald-500' : (record ? 'text-white/10' : 'text-slate-800')} group-hover:scale-110`}>{date.date()}</span>
                                        
                                        <div className="flex flex-col items-center gap-4 relative z-10">
                                            {record ? (
                                                <>
                                                    <div className={`w-20 h-20 rounded-full ${config?.bg} flex items-center justify-center ${config?.color} border ${config?.border} shadow-2xl transition-all duration-700 group-hover:rotate-12`}>
                                                        <Icon size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] font-outfit mb-1 ${config?.color}`}>{record.status}</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{record.arrivalTime || 'Ref Logged'}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-slate-800 opacity-20 group-hover:opacity-40 transition-opacity">
                                                    <Activity size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History Table (Merged from Upstream) */}
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl pt-10">
                <div className="px-12 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                            <Layers size={24} className="text-emerald-500" /> Recent Sequence History
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Institutional Arrival Metadata</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left italic">
                        <thead>
                            <tr className="bg-slate-950/40">
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Temporal Marker</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 text-center">Protocol Status</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5">Log Breakdown</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 border-b border-white/5 text-right">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {attendance?.slice(0, 10).map((log, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-all duration-300 group">
                                    <td className="px-12 py-8">
                                        <div>
                                            <p className="text-base font-black text-white tracking-tighter uppercase mb-0.5 group-hover:text-emerald-400 transition-colors">{moment(log.date).format('DD MMM YYYY')}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{moment(log.date).format('dddd')}</p>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8">
                                        <div className="flex justify-center">
                                            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${log.status === 'Present' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Check-In</span>
                                                <span className="text-sm font-black text-emerald-400 tracking-tighter ">{log.arrivalTime || '--:--'}</span>
                                            </div>
                                            <div className="h-10 w-px bg-white/5"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Check-Out</span>
                                                <span className="text-sm font-black text-slate-500 tracking-tighter">{log.departureTime || '--:--'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8 text-right">
                                        <p className="text-xs font-black text-slate-500 italic uppercase tracking-tight">{log.remarks || 'Electronic Sync Clear'}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedDate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDate(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-slate-900 border border-white/10 rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                            <div className="p-16 space-y-12">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500 font-outfit">Operational Log</p>
                                        <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none font-outfit">{moment(selectedDate.date).format('MMMM DD, YYYY')}</h3>
                                    </div>
                                    <div className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] font-outfit ${statusConfig[selectedDate.status]?.bg} ${statusConfig[selectedDate.status]?.color} border-2 ${statusConfig[selectedDate.status]?.border} shadow-2xl`}>
                                        {selectedDate.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="p-3 bg-white/5 rounded-xl"><Clock size={16} /></div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Delta</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                            <p className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{selectedDate.arrivalTime || '--:--'}</p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic font-outfit">Duty Check-In Timestamp</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="p-3 bg-white/5 rounded-xl"><Info size={16} /></div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Notes</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                            <p className="text-[11px] font-black text-slate-400 uppercase leading-relaxed italic line-clamp-2">{selectedDate.remarks || '-- No Operational Exceptions Registered --'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedDate(null)} className="w-full py-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.5em] text-white transition-all duration-500 font-outfit">Dismiss Registry</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DriverAttendance;
