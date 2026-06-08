import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAttendance } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, Calendar,
    ChevronLeft, ChevronRight, X,
    TrendingUp, AlertCircle
} from 'lucide-react';
import moment from 'moment';

const AttendanceHistory = () => {
    const dispatch = useDispatch();
    const { attendance, loading } = useSelector((s) => s.student);
    const { activeAcademicYear } = useSelector((s) => s.academicYear);

    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (activeAcademicYear?.startDate) {
            const start = moment(activeAcademicYear.startDate);
            const today = moment();
            if (today.isBetween(moment(activeAcademicYear.startDate), moment(activeAcademicYear.endDate), 'day', '[]')) {
                setCurrentMonth(today);
            } else {
                setCurrentMonth(start);
            }
        }
    }, [activeAcademicYear]);

    useEffect(() => {
        dispatch(fetchStudentAttendance());
    }, [dispatch, activeAcademicYear]);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total   = attendance.length;
        const present = attendance.filter(a => ['Present', 'Late', 'Half-Day'].includes(a.status)).length;
        const absent  = attendance.filter(a => a.status === 'Absent').length;
        const late    = attendance.filter(a => a.status === 'Late').length;
        const pct     = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
        return { total, present, absent, late, pct };
    }, [attendance]);

    // ── Status config ────────────────────────────────────────────────────────
    const STATUS = {
        Present:  { icon: CheckCircle, color: 'text-emerald-400',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20',  dot: 'bg-emerald-400',  sub: 'Stable Signal' },
        Absent:   { icon: XCircle,      color: 'text-rose-400',     bg: 'bg-rose-500/10',     border: 'border-rose-500/20',     dot: 'bg-rose-400',     sub: 'Signal Lost' },
        Late:     { icon: Clock,        color: 'text-amber-400',    bg: 'bg-amber-500/10',    border: 'border-amber-500/20',    dot: 'bg-amber-400',    sub: 'Sync Delayed' },
        'Half-Day':{ icon: Clock,       color: 'text-blue-400',     bg: 'bg-blue-500/10',     border: 'border-blue-500/20',     dot: 'bg-blue-400',     sub: 'Partial Session' },
        'No Record': { icon: Calendar,  color: 'text-slate-400',    bg: 'bg-slate-500/10',    border: 'border-slate-500/20',    dot: 'bg-slate-400',    sub: 'Awaiting Telemetry' },
    };

    // ── Calendar grid ────────────────────────────────────────────────────────
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
                    week.push(startOfMonth.clone().subtract(startDay - j, 'days'));
                } else if (day <= daysInMonth) {
                    week.push(startOfMonth.clone().date(day));
                    day++;
                } else {
                    week.push(endOfMonth.clone().add(day - daysInMonth, 'days'));
                    day++;
                }
            }
            grid.push(week);
        }
        return grid;
    }, [currentMonth]);

    const getRecord = (date) =>
        date ? attendance.find(a => moment(a.date).isSame(date, 'day')) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-luxury-emerald rounded-md shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-white">
                            Attendance
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium">
                        Monthly attendance record & presence telemetry.
                    </p>
                </motion.div>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { icon: TrendingUp,   label: 'Attendance Rate', value: `${stats.pct}%`, color: 'from-emerald-500 to-teal-600',  sub: `${stats.present} of ${stats.total} days` },
                    { icon: CheckCircle, label: 'Present Days',    value: stats.present,  color: 'from-brand-primary to-indigo-600', sub: 'Including late arrivals' },
                    { icon: Clock,        label: 'Late Arrivals',   value: stats.late,     color: 'from-amber-500 to-orange-600', sub: 'Marked as late' },
                    { icon: XCircle,      label: 'Absent Days',     value: stats.absent,   color: 'from-rose-500 to-pink-600',    sub: 'Unexcused absences' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="p-6 rounded-md bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 hover:scale-[1.02] transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-4 rounded-md bg-gradient-to-br ${s.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                                <s.icon size={24} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{s.sub}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{s.label}</p>
                        <h3 className="text-4xl font-black tracking-tighter font-outfit text-white leading-none">{s.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* ── Calendar ────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl"
            >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/5 shrink-0">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{currentMonth.format('MMMM YYYY')}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-mono mt-1">Attendance Presence Telemetry</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 border border-white/5 rounded-2xl px-5 py-3.5 shadow-inner">
                        {Object.entries(STATUS).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner shrink-0">
                        <button 
                            onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
                            className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(moment())}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-white transition-all tracking-widest"
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
                            className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-6 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-xs font-black uppercase tracking-[0.4em] text-slate-600 pb-4">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-6">
                    {calendarGrid.flat().map((date, i) => {
                        const isCurrentMonth = date.month() === currentMonth.month();
                        const isToday = date.isSame(moment(), 'day');
                        
                        const record = getRecord(date);
                        const cfg = record ? STATUS[record.status] : null;

                        return (
                            <motion.div 
                                key={i} 
                                whileHover={isCurrentMonth ? { scale: 1.02, y: -4 } : {}}
                                whileTap={isCurrentMonth ? { scale: 0.98 } : {}}
                                onClick={() => {
                                    if (isCurrentMonth) {
                                        if (record) {
                                            setSelectedDate(record);
                                        } else {
                                            setSelectedDate({
                                                date: date.format('YYYY-MM-DD'),
                                                status: 'No Record',
                                                arrivalTime: '—',
                                                departureTime: '—',
                                                remarks: 'No attendance telemetry recorded for this session.'
                                            });
                                        }
                                    }
                                }} 
                                className={`relative aspect-square rounded-[2rem] p-6 cursor-pointer transition-all duration-500 group border flex flex-col items-center justify-center overflow-hidden 
                                    ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''} 
                                    ${isToday ? 'bg-brand-primary/10 border-brand-primary/30 shadow-2xl shadow-brand-primary/10' : 'bg-slate-950/40 border-white/5 hover:border-brand-primary/40'} 
                                    ${cfg ? `${cfg.bg} ${cfg.border}` : ''}`}
                            >
                               {/* Small Date Indicator at Top */}
                                <span className={`absolute top-6 left-8 text-sm font-black italic tracking-tighter transition-colors duration-500
                                    ${isToday ? 'text-brand-primary' : 'text-slate-600 group-hover:text-white'} 
                                    ${cfg ? cfg.color : ''}`}>
                                    {date.date()}
                                </span>

                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    {cfg ? (
                                        <>
                                            <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color} shadow-lg shadow-black/20 mb-1`}>
                                                <cfg.icon size={24} />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className={`text-[10px] font-black ${cfg.color} tracking-[0.2em] uppercase`}>{record.status}</div>
                                                <div className={`text-[8px] font-bold opacity-40 ${cfg.color} uppercase tracking-[0.1em] mt-0.5`}>{cfg.sub}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-slate-400 transition-colors duration-500 mb-1">
                                                <Calendar size={20} />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors duration-500 tracking-[0.2em] uppercase">No Record</div>
                                        </>
                                    )}
                                </div>

                                {/* Corner Pulse Indicator for Today */}
                                {isToday && (
                                    <div className="absolute top-6 right-8">
                                        <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_15px_#2563eb] animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Detail modal via portal ──────────────────────────────── */}
            {ReactDOM.createPortal(
                <AnimatePresence mode="wait">
                    {selectedDate && (
                        (() => {
                            const cfg  = STATUS[selectedDate.status] || STATUS['Present'];
                            const Icon = cfg.icon || Calendar;
                            const accentGradient =
                                selectedDate.status === 'Present'   ? 'from-emerald-500 to-teal-500'   :
                                selectedDate.status === 'Absent'    ? 'from-rose-500 to-pink-500'       :
                                selectedDate.status === 'Late'      ? 'from-amber-500 to-orange-500'    :
                                selectedDate.status === 'Half-Day'  ? 'from-blue-500 to-indigo-500'    :
                                'from-slate-500 to-slate-700';

                            return (
                                <div 
                                    key="attendance-modal"
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        zIndex: 9999,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '24px',
                                    }}
                                >
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        onClick={() => setSelectedDate(null)}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(0,0,0,0.75)',
                                            backdropFilter: 'blur(4px)',
                                        }}
                                    />

                                    {/* Modal panel */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                        transition={{ 
                                            type: 'spring', 
                                            damping: 25, 
                                            stiffness: 300,
                                            duration: 0.3
                                        }}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            maxWidth: '440px',
                                            maxHeight: 'calc(100vh - 48px)',
                                            backgroundColor: '#0b1120',
                                            border: '1px solid #1e293b',
                                            borderRadius: '12px',
                                            boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Accent strip — always visible at top */}
                                        <div className={`flex-shrink-0 h-1 w-full bg-gradient-to-r ${accentGradient}`} />

                                        {/* Scrollable body */}
                                        <div className="overflow-y-auto p-8">
                                            {/* Header row */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                                        <Icon size={24} className={cfg.color} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
                                                            Attendance Record
                                                        </p>
                                                        <h3 className="text-2xl font-black text-white tracking-tight">
                                                            {moment(selectedDate.date).format('DD MMM YYYY')}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDate(null)}
                                                    className="p-2 hover:bg-white/5 rounded-md transition-colors text-slate-500 hover:text-white flex-shrink-0"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            {/* Status badge */}
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-black uppercase tracking-widest mb-6 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                {selectedDate.status}
                                            </div>

                                            {/* Time grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock size={13} className="text-slate-500" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arrival</p>
                                                    </div>
                                                    <p className="text-xl font-black text-white">
                                                        {selectedDate.arrivalTime || '—'}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock size={13} className="text-slate-500" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Departure</p>
                                                    </div>
                                                    <p className="text-xl font-black text-white">
                                                        {selectedDate.departureTime || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Remarks */}
                                            {selectedDate.remarks && (
                                                <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-lg mb-6">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Remarks</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{selectedDate.remarks}</p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setSelectedDate(null)}
                                                className="w-full py-3 bg-slate-900/60 border border-slate-800/60 hover:bg-white/5 rounded-md text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })()
                    )}
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
};

export default AttendanceHistory;
