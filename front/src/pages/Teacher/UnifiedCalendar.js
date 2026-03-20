import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnifiedCalendar } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    Clock, 
    FileText, 
    Trophy, 
    LogOut,
    Activity,
    Layers,
    AlertCircle
} from 'lucide-react';

const TeacherUnifiedCalendar = () => {
    const dispatch = useDispatch();
    const { unifiedCalendar, loading } = useSelector(state => state.teacher);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        dispatch(fetchUnifiedCalendar());
    }, [dispatch]);

    // Calendar logic
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        const grid = [];
        // Padding for first week
        for (let i = 0; i < firstDay; i++) {
            grid.push({ day: null, date: null });
        }
        for (let d = 1; d <= days; d++) {
            grid.push({ day: d, date: new Date(year, month, d) });
        }
        return grid;
    }, [currentDate]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        if (!unifiedCalendar) return {};
        const map = {};

        const addEvent = (date, event) => {
            const key = new Date(date).toDateString();
            if (!map[key]) map[key] = [];
            map[key].push(event);
        };

        // 1. Timetable (Recurring)
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // For timetable, we just show it for the current month's days matching the day of week
        calendarGrid.forEach(cell => {
            if (!cell.date) return;
            const dayName = dayNames[cell.date.getDay()];
            unifiedCalendar.timetable?.forEach(tt => {
                tt.slots?.filter(s => s.day === dayName).forEach(s => {
                    addEvent(cell.date, { type: 'lecture', title: `${s.subject} (${tt.classSection?.sectionLabel})`, time: s.startTime, color: 'border-brand-primary' });
                });
            });
        });

        // 2. Exams
        unifiedCalendar.exams?.forEach(ex => {
            addEvent(ex.date, { type: 'exam', title: `Exam: ${ex.title}`, time: ex.startTime, color: 'border-luxury-rose' });
        });

        // 3. Assignments
        unifiedCalendar.assignments?.forEach(as => {
            addEvent(as.dueDate, { type: 'assignment', title: `Due: ${as.title}`, time: '23:59', color: 'border-luxury-amber' });
        });

        // 4. Leaves
        unifiedCalendar.leaves?.forEach(lv => {
            // Support multi-day leaves if models have startDate/endDate, otherwise use date
            addEvent(lv.startDate || lv.date, { type: 'leave', title: 'Approved Leave', time: 'Full Day', color: 'border-emerald-500' });
        });

        return map;
    }, [unifiedCalendar, calendarGrid]);

    const changeMonth = (offset) => {
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(nextMonth);
    };

    if (loading && !unifiedCalendar) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Synchronizing Professional Roadmap</p>
        </div>
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-brand-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] italic">Institutional Roadmap</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Unified Terminal View</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">Synchronized stream of lectures, assessments, homework cycles, and approved leaves.</p>
                </div>

                <div className="flex items-center gap-6 bg-slate-950/80 p-2 rounded-md border border-slate-800/60 shadow-inner">
                    <button onClick={() => changeMonth(-1)} className="p-4 hover:bg-slate-800 rounded-md text-slate-400 transition-all"><ChevronLeft size={20}/></button>
                    <div className="min-w-[180px] text-center">
                        <p className="text-base font-black text-white uppercase italic tracking-tighter font-outfit">{monthNames[currentDate.getMonth()]}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{currentDate.getFullYear()}</p>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-4 hover:bg-slate-800 rounded-md text-slate-400 transition-all"><ChevronRight size={20}/></button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-3">
                    <div className="bg-slate-950/80 border border-slate-800/60 rounded-md shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
                        <div className="grid grid-cols-7 border-b border-slate-800/60 bg-slate-900/60">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 relative">
                            {calendarGrid.map((cell, idx) => {
                                const dayEvents = cell.date ? eventsByDate[cell.date.toDateString()] : null;
                                const isToday = cell.date?.toDateString() === new Date().toDateString();

                                return (
                                    <div key={idx} className={`min-h-[160px] border-r border-b border-slate-800/40 p-4 transition-all hover:bg-white/[0.02] group ${!cell.day ? 'bg-slate-950/20' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-xs font-black italic font-outfit ${isToday ? 'bg-brand-primary text-white w-8 h-8 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                                {cell.day}
                                            </span>
                                            {dayEvents?.length > 0 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {dayEvents?.slice(0, 3).map((ev, i) => (
                                                <div key={i} className={`p-2 rounded-md bg-slate-900/80 border-l-2 ${ev.color} text-[8px] font-black text-white uppercase tracking-tight truncate shadow-xl hover:scale-[1.02] transition-transform cursor-pointer`}>
                                                    {ev.title}
                                                </div>
                                            ))}
                                            {dayEvents?.length > 3 && (
                                                <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest text-center mt-2">+{dayEvents.length - 3} Protocols</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.35em] mb-8 italic flex items-center gap-3">
                            <Layers size={14} className="text-brand-primary" /> Sector Legend
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Lectures', color: 'bg-brand-primary', icon: Clock },
                                { label: 'Assessments', color: 'bg-luxury-rose', icon: Trophy },
                                { label: 'Homework', color: 'bg-luxury-amber', icon: FileText },
                                { label: 'Approved Leave', color: 'bg-emerald-500', icon: LogOut },
                            ].map((l, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className={`w-10 h-10 rounded-md ${l.color}/10 border border-${l.color} flex items-center justify-center ${l.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
                                        <l.icon size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-white transition-colors">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-brand-primary/20 p-8 rounded-md backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <AlertCircle size={80} className="text-brand-primary" />
                        </div>
                        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 italic">Proximity Alert</h3>
                        <p className="text-white text-xs font-bold leading-relaxed uppercase italic">Automatic archival synchronization for the next academic cycle will commence in 24 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherUnifiedCalendar;
