import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTimetable } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Calendar,
    MapPin,
    BookOpen,
    Layers,
    Users,
    Printer,
    LayoutGrid,
    List,
    ChevronRight,
    ArrowRight,
    Search,
    Download,
    Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Timetable = () => {
    const dispatch = useDispatch();
    const { timetable, loading } = useSelector((state) => state.student);
    const [activeDay, setActiveDay] = useState('Monday');
    const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        dispatch(fetchStudentTimetable());
        const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(dayName)) {
            setActiveDay(dayName);
        }
    }, [dispatch]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailySchedule = timetable?.schedule?.find(s => s.day === activeDay)?.periods || [];

    // Helper to get time color / intensity
    const getTimeIntensity = (time) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 10) return 'from-cyan-500 to-blue-600';
        if (hour < 13) return 'from-luxury-emerald to-emerald-600';
        if (hour < 16) return 'from-brand-primary to-blue-600';
        return 'from-rose-500 to-purple-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 max-w-7xl mx-auto pb-20 font-outfit"
        >
            {/* Header */}
            <header className="relative overflow-hidden bg-[#0f0f12] border border-slate-800/60 p-10 md:p-14 rounded-md shadow-2xl backdrop-blur-3xl group no-print font-outfit">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-luxury-emerald/5 to-transparent skew-x-12 -mr-20 font-outfit"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary/5 rounded-md blur-[100px] opacity-50 font-outfit"></div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12 font-outfit">
                    <div className="space-y-6 font-outfit">
                        <div className="flex items-center gap-4 font-outfit">
                            <span className="px-3 py-1 bg-luxury-emerald/10 text-luxury-emerald text-[9px] font-black uppercase tracking-[0.4em] border border-luxury-emerald/20 rounded-md italic font-outfit">Academic Calendar</span>
                            <span className="w-1.5 h-1.5 rounded-md bg-slate-800 font-outfit"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-outfit">{new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Class <span className="text-brand-primary">Timetable</span></h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl italic font-outfit">Access your daily class schedule, subject periods, and teacher assignments.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 font-outfit">
                        <div className="flex bg-slate-950/60 p-1.5 rounded-md border border-slate-800 shadow-inner h-16 items-center font-outfit">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic font-outfit ${viewMode === 'daily' ? 'bg-brand-primary text-black shadow-lg translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <List size={16} className="font-outfit" /> Daily Schedule
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic font-outfit ${viewMode === 'weekly' ? 'bg-brand-primary text-black shadow-lg translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <LayoutGrid size={16} className="font-outfit" /> Weekly View
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Day Selector */}
            <nav className="no-print flex items-center justify-center font-outfit">
                <div className="flex bg-[#0f0f12] p-2 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar font-outfit">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => { setActiveDay(day); setViewMode('daily'); }}
                            className={`relative px-10 py-5 rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 whitespace-nowrap overflow-hidden group/nav font-outfit ${activeDay === day && viewMode === 'daily'
                                ? 'text-brand-primary'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {activeDay === day && viewMode === 'daily' && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-x-4 bottom-1 h-0.5 bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.8)] font-outfit"
                                />
                            )}
                            <span className="relative z-10 font-outfit italic font-outfit">{day.slice(0, 3)}</span>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[30px] opacity-0 group-hover/nav:opacity-5 transition-opacity font-black select-none pointer-events-none font-outfit">{idx + 1}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {viewMode === 'daily' ? (
                    <motion.div
                        key="daily"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start no-print font-outfit"
                    >
                        {/* Summary Deck */}
                        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 font-outfit">
                            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md p-10 shadow-2xl space-y-12 font-outfit">
                                <div className="space-y-4 font-outfit">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-outfit italic flex items-center gap-3 font-outfit">
                                        <div className="w-8 h-px bg-brand-primary font-outfit"></div> Daily Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 font-outfit">
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md group hover:border-brand-primary/30 transition-all font-outfit">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic font-outfit">Total Periods</p>
                                            <p className="text-3xl font-black text-white font-outfit italic font-outfit">0{dailySchedule.length}</p>
                                        </div>
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md font-outfit">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic font-outfit">Study Hours</p>
                                            <p className="text-3xl font-black text-white font-outfit italic font-outfit">{(dailySchedule.length * 0.75).toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 font-outfit">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-6 font-outfit">Subjects Today</h4>
                                    <div className="space-y-4 font-outfit">
                                        {Array.from(new Set(dailySchedule.map(s => s.subject?.name || 'General'))).map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between text-[11px] font-bold text-slate-400 group cursor-pointer hover:text-white transition-colors font-outfit">
                                                <div className="flex items-center gap-3 font-outfit">
                                                    <div className="w-1.5 h-1.5 rounded-md bg-brand-primary group-hover:scale-150 transition-transform font-outfit"></div>
                                                    <span className="uppercase tracking-widest font-outfit">{sub}</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity font-outfit" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-800/60 font-outfit">
                                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-md flex items-center gap-5 group cursor-help font-outfit">
                                        <div className="p-3 bg-indigo-500/20 rounded text-indigo-400 group-hover:scale-110 transition-transform font-outfit"><Layers size={18} className="font-outfit" /></div>
                                        <p className="text-[10px] font-black text-indigo-300 italic uppercase leading-relaxed tracking-wider font-outfit">
                                            Timetable is up to date with the latest school schedule.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-1 rounded-md shadow-[0_0_50px_rgba(37,99,235,0.1)] bg-brand-primary font-outfit">
                                <button className="w-full py-5 bg-[#0f0f12] hover:bg-slate-900 rounded-md text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic group font-outfit">
                                    Download PDF <Download size={16} className="group-hover:translate-y-1 transition-transform font-outfit" />
                                </button>
                            </div>
                        </aside>

                        {/* Timeline Feed */}
                        <div className="lg:col-span-8 space-y-8 font-outfit font-outfit">
                            {dailySchedule.length > 0 ? (
                                <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-brand-primary before:via-slate-800 before:to-slate-950 font-outfit">
                                    {dailySchedule.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                                            onMouseEnter={() => setHoveredNode(idx)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className="group relative font-outfit"
                                        >
                                            {/* Node Marker */}
                                            <div className={`absolute -left-[53px] top-6 w-10 h-10 rounded-md border-4 border-[#0f0f12] bg-[#0f0f12] flex items-center justify-center z-10 transition-all duration-500 font-outfit ${hoveredNode === idx ? 'scale-125 border-brand-primary' : ''}`}>
                                                <div className={`w-3 h-3 rounded-md bg-gradient-to-tr ${getTimeIntensity(slot.startTime)} transition-all duration-700 font-outfit ${hoveredNode === idx ? 'scale-150 rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.8)]' : ''}`}></div>
                                            </div>

                                            {/* Period Card */}
                                            <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md hover:border-brand-primary/30 transition-all duration-700 relative overflow-hidden group/card shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-outfit">
                                                <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-white/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity font-outfit"></div>

                                                <div className="flex flex-col md:flex-row gap-12 relative z-10 font-outfit">
                                                    {/* Time & Meta */}
                                                    <div className="md:w-48 space-y-6 shrink-0 border-r border-slate-800/60 pr-8 font-outfit">
                                                        <div className="space-y-1 font-outfit">
                                                            <div className="flex items-center gap-2 text-brand-primary mb-2 font-outfit">
                                                                <Clock size={16} className="animate-pulse font-outfit" />
                                                                <span className="text-xl font-black italic tracking-tighter font-outfit uppercase font-outfit">{slot.startTime}</span>
                                                            </div>
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-tight font-outfit">Duration Until {slot.endTime}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-md border border-slate-800/60 group-hover/card:border-brand-primary/20 transition-all shadow-inner font-outfit">
                                                            <MapPin size={16} className="text-brand-primary font-outfit" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic font-outfit">{slot.room || 'Classroom'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Subject & Faculty */}
                                                    <div className="flex-1 space-y-8 font-outfit">
                                                        <div className="space-y-3 font-outfit">
                                                            <div className="flex items-center gap-3 font-outfit">
                                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.5em] italic font-outfit">Period 0{idx + 1}</span>
                                                                <div className="flex-1 h-px bg-slate-900 font-outfit font-outfit"></div>
                                                            </div>
                                                            <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none group-hover/card:text-brand-primary transition-all duration-500 font-outfit">
                                                                {slot.subject?.name || 'Subject Topic'}
                                                            </h4>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-10 font-outfit">
                                                            <div className="flex items-center gap-4 font-outfit">
                                                                <div className="w-12 h-12 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover/card:border-brand-primary/30 group-hover:text-brand-primary transition-all shadow-xl font-outfit">
                                                                    <Users size={20} className="font-outfit" />
                                                                </div>
                                                                <div className="font-outfit">
                                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic font-outfit">Subject Teacher</p>
                                                                    <p className="text-[13px] font-black text-white uppercase italic tracking-tight font-outfit">{slot.teacher?.firstName} {slot.teacher?.lastName || 'Teacher'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-48 text-center bg-[#0f0f12] rounded-md border border-dashed border-slate-800/60 shadow-inner group font-outfit">
                                    <Calendar size={100} className="text-slate-900 mx-auto mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 opacity-20 font-outfit" />
                                    <h3 className="text-3xl font-black text-slate-700 uppercase tracking-[0.5em] font-outfit mb-4 italic font-outfit">No Classes Today</h3>
                                    <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed italic font-outfit">There are no classes scheduled for {activeDay}.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl p-1 no-print font-outfit"
                    >
                        <div className="w-full font-outfit overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-1 table-fixed min-w-[1000px] font-outfit">
                                <thead>
                                    <tr className="font-outfit">
                                        <th className="p-4 bg-black/40 rounded-md border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 italic font-outfit w-24">Time</th>
                                        {days.map(d => (
                                            <th key={d} className={`p-4 rounded-md border transition-all duration-500 text-center font-outfit ${activeDay === d ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' : 'bg-black/40 border-slate-800 text-slate-500 font-outfit'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] font-outfit italic leading-none font-outfit">{d.slice(0, 3)}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="font-outfit">
                                    {[1, 2, 3, 4, 5, 6, 7].map(periodIndex => (
                                        <tr key={periodIndex} className="font-outfit">
                                            <td className="p-4 bg-slate-950/40 rounded-md border border-slate-800 text-center font-outfit">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none font-outfit">Period 0{periodIndex}</span>
                                            </td>
                                            {days.map(day => {
                                                const slot = timetable?.schedule?.find(s => s.day === day)?.periods[periodIndex - 1];
                                                return (
                                                    <td key={day} className={`p-4 rounded-md border relative transition-all duration-300 group/slot h-32 font-outfit ${slot ? 'bg-slate-900/40 border-slate-800/80 hover:border-brand-primary/30 cursor-pointer shadow-xl' : 'bg-black/20 border-slate-900/40 opacity-40 font-outfit'}`}>
                                                        {slot ? (
                                                            <div className="space-y-3 font-outfit">
                                                                <div className="flex items-center justify-between font-outfit">
                                                                    <span className={`text-[8px] font-black italic uppercase tracking-widest font-outfit ${slot.type === 'Break' ? 'text-student-primary' : 'text-brand-primary'}`}>{slot.startTime}</span>
                                                                    <div className={`w-1.5 h-1.5 rounded-sm bg-slate-700 group-hover/slot:bg-brand-primary animate-pulse font-outfit ${slot.type === 'Break' ? 'group-hover/slot:bg-student-primary' : ''}`}></div>
                                                                </div>
                                                                <h5 className={`font-black italic uppercase tracking-tighter text-[11px] font-outfit line-clamp-1 transition-colors font-outfit ${slot.type === 'Break' ? 'text-student-primary' : 'text-white group-hover/slot:text-brand-primary'}`}>
                                                                    {slot.type === 'Break' ? 'Break' : (slot.subject?.name || 'Subject')}
                                                                </h5>
                                                                <div className="flex flex-col gap-1 text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none font-outfit">
                                                                    {slot.type !== 'Break' ? (
                                                                        <div className="font-outfit">
                                                                            <span className="truncate italic group-hover/slot:text-slate-400 font-outfit">{slot.teacher?.lastName || 'Teacher'}</span>
                                                                            <span className="italic flex items-center gap-1 font-outfit font-outfit"><MapPin size={8} className="font-outfit" /> RM {slot.room || 'A01'}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-student-primary/60 flex items-center gap-1 italic font-outfit">Intermission</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full bg-slate-950/20 rounded border-dashed border border-slate-900/40 font-outfit"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print View */}
            <div className="print-only w-full text-black bg-white p-2 font-outfit">
                <style>{`
                    @media print {
                        @page { margin: 1cm; size: landscape; }
                        body { background: white !important; color: black !important; }
                    }
                `}</style>
                <div className="mb-10 pb-6 border-b-2 border-slate-900 flex justify-between items-end font-outfit">
                    <div className="space-y-2 font-outfit">
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter font-outfit">School Academic Timetable</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] italic font-outfit">Official School Record // 2026</p>
                    </div>
                    <div className="text-right font-outfit">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1 font-outfit">Date</p>
                        <p className="text-xl font-black italic font-outfit">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-0 border-2 border-slate-900 divide-x-2 divide-slate-900 bg-white font-outfit">
                    {days.map(day => (
                        <div key={day} className="flex flex-col font-outfit">
                            <div className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest text-center italic border-b-2 border-slate-900 font-outfit">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 min-h-[600px] font-outfit">
                                {(timetable?.schedule?.find(s => s.day === day)?.periods || []).map((slot, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 bg-slate-50 rounded space-y-2 font-outfit">
                                        <div className="flex items-center justify-between font-outfit">
                                            <span className="text-[9px] font-black text-emerald-600 italic leading-none font-outfit">{slot.startTime}</span>
                                            <span className="text-[8px] font-bold text-slate-400 italic font-outfit">UNTIL {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[11px] font-black uppercase tracking-tight italic leading-tight text-black border-b border-slate-200 pb-2 font-outfit">
                                            {slot.subject?.name || slot.subject || 'Subject'}
                                        </h4>
                                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase italic font-outfit">
                                            <span className="font-outfit">{slot.teacher?.firstName || 'Staff'}</span>
                                            <span className="font-outfit">RM: {slot.room || 'TBA'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-between items-center px-4 font-outfit">
                    <p className="text-[8px] font-black text-slate-400 uppercase italic tracking-widest font-outfit">Official Timetable // End of Report</p>
                    <p className="text-[8px] font-bold italic text-slate-600 font-outfit">Generated via School Management System</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Timetable;
