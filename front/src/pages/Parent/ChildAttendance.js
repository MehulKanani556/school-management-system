import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildAttendance } from '../../redux/slice/parent.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Activity, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import moment from 'moment';

const ChildAttendance = () => {
    const dispatch = useDispatch();
    const { selectedChild, attendance, attendanceLoading: loading } = useSelector((state) => state.parent);

    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (selectedChild?._id) {
            const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
            dispatch(fetchChildAttendance({ 
                studentId: selectedChild._id, 
                startDate: startOfMonth, 
                endDate: endOfMonth 
            }));
        }
    }, [selectedChild?._id, currentMonth, dispatch]);

    const stats = useMemo(() => {
        const total = attendance.length;
        const present = attendance.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const late = attendance.filter(a => a.status === 'Late').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
        return { total, present, absent, late, percentage };
    }, [attendance]);

    const statusConfig = {
        'Present': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', shadow: 'shadow-emerald-500/20' },
        'Absent': { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20' },
        'Late': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', shadow: 'shadow-amber-500/20' },
        'Half-Day': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'shadow-blue-500/20' },
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 bg-slate-900/40 p-12 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-16 h-[2px] bg-brand-primary rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary font-outfit">Guardian Terminal</span>
                    </div>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Child Presence Log</h1>
                    <div className="flex items-center gap-4 py-2 px-6 bg-white/[0.03] rounded-2xl border border-white/5 w-fit group hover:border-brand-primary/30 transition-all duration-500">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <p className="text-slate-500 font-bold text-sm tracking-wide italic">Historical participation telemetry for <span className="text-white font-black group-hover:text-brand-primary transition-colors">{selectedChild?.firstName} {selectedChild?.lastName}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: 'Integrity', val: `${stats.percentage}%`, color: 'text-emerald-400' },
                        { label: 'Present', val: stats.present, color: 'text-emerald-400' },
                        { label: 'Delayed', val: stats.late, color: 'text-amber-400' },
                        { label: 'Loss', val: stats.absent, color: 'text-rose-500' },
                    ].map((st, i) => (
                        <div key={i} className="flex flex-col items-center justify-center px-10 py-6 bg-slate-950/40 border border-white/5 rounded-2xl shadow-2xl group transition-all duration-500 hover:border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2 font-outfit">{st.label}</p>
                            <p className={`text-4xl font-black italic tracking-tighter ${st.color}`}>{st.val}</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-12 shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/10 ring-1 ring-brand-primary/20 group hover:scale-105 transition-all duration-700">
                            <CalendarIcon size={48} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none font-outfit">{currentMonth.format('MMMM YYYY')}</h2>
                            <div className="flex items-center gap-4">
                                <span className="w-10 h-[1px] bg-slate-700"></span>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-outfit">Academic Participation Cycle</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-3xl border border-white/10 shadow-3xl backdrop-blur-2xl">
                        <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-5 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group"><ChevronLeft size={28} className="group-active:-translate-x-1 transition-transform" /></button>
                        <button onClick={() => setCurrentMonth(moment())} className="px-12 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-white transition-all tracking-[0.4em] font-outfit border border-white/5">Sync Today</button>
                        <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-5 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white group"><ChevronRight size={28} className="group-active:translate-x-1 transition-transform" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-6">

                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 pb-4 font-outfit border-b border-white/5 mb-6">{d}</div>
                    ))}
                    {calendarGrid.flat().map((date, i) => {
                        if (!date) return <div key={i} className="aspect-square opacity-0 pointer-events-none" />;
                        
                        const isToday = date.isSame(moment(), 'day');
                        const record = attendance.find(a => moment(a.date).isSame(date, 'day'));
                        const config = record ? statusConfig[record.status] : null;
                        const Icon = config?.icon;

                        return (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => record && setSelectedDate(record)}
                                className={`relative aspect-square rounded-2xl p-6 cursor-pointer transition-all duration-500 group border flex flex-col items-center justify-center overflow-hidden font-outfit ${isToday ? 'bg-brand-primary/5 border-brand-primary/30 ring-2 ring-brand-primary/20 shadow-2xl' : 'bg-slate-950/40 border-white/5 hover:border-white/10'} ${config ? `${config.bg.replace('/10', '/5')} ${config.border.replace('/20', '/30')} ${config.shadow}` : ''}`}
                            >
                                <span className={`absolute top-6 left-6 text-sm font-black tracking-tighter ${config ? config.color : 'text-slate-600 group-hover:text-slate-400'}`}>{date.date()}</span>
                                
                                <div className="flex flex-col items-center gap-6">
                                    {config ? (
                                        <>
                                            <div className={`w-16 h-16 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center ${config.color} shadow-2xl transition-all duration-700`}>
                                                <Icon size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className={`text-[12px] font-black uppercase tracking-widest font-outfit ${config.color}`}>{record.status}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{record.arrivalTime || 'Registry Active'}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-center text-slate-800 opacity-20 group-hover:opacity-40 transition-opacity">
                                                <Activity size={24} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700/40 group-hover:text-slate-500 transition-colors font-outfit italic">Pending</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );

                    })}
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
                                        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-primary font-outfit">Timeline Registry</p>
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
                                            <p className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{selectedDate.arrivalTime || '09:00 AM'}</p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Arrival Signal Timestamp</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="p-3 bg-white/5 rounded-xl"><Info size={16} /></div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Log</p>
                                        </div>
                                        <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                            <p className="text-[11px] font-black text-slate-400 uppercase leading-relaxed italic line-clamp-2">{selectedDate.remarks || '-- No Operational Exceptions Registered --'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedDate(null)} className="w-full py-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.5em] text-white transition-all duration-500 font-outfit">Dismiss Terminal</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChildAttendance;
