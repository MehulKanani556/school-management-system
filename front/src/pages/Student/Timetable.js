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
        if (hour < 16) return 'from-amber-400 to-orange-600';
        return 'from-rose-500 to-purple-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 max-w-7xl mx-auto pb-20"
        >
            {/* ─── Neural Navigation Header ─────────────────────────────────────── */}
            <header className="relative overflow-hidden bg-[#0f0f12] border border-slate-800/60 p-10 md:p-14 rounded-md shadow-2xl backdrop-blur-3xl group no-print">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-luxury-emerald/5 to-transparent skew-x-12 -mr-20"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-primary/5 rounded-md blur-[100px] opacity-50"></div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-luxury-emerald/10 text-luxury-emerald text-[9px] font-black uppercase tracking-[0.4em] border border-luxury-emerald/20 rounded-md italic">Temporal Index 2.0</span>
                            <span className="w-1.5 h-1.5 rounded-md bg-slate-800"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Chronos <span className="text-luxury-emerald">Matrix</span></h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl italic">Unified pedagogical schedule and academic sequence mapping for institutional synchronization.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex bg-slate-950/60 p-1.5 rounded-md border border-slate-800 shadow-inner h-16 items-center">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${viewMode === 'daily' ? 'bg-luxury-emerald text-black shadow-glow translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <List size={16} /> Daily View
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-8 h-full rounded-md flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${viewMode === 'weekly' ? 'bg-luxury-emerald text-black shadow-glow translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}
                            >
                                <LayoutGrid size={16} /> Weekly Matrix
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Day Selector Axis ────────────────────────────────────────────── */}
            <nav className="no-print flex items-center justify-center">
                <div className="flex bg-[#0f0f12] p-2 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar">
                    {days.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => { setActiveDay(day); setViewMode('daily'); }}
                            className={`relative px-10 py-5 rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 whitespace-nowrap overflow-hidden group/nav ${activeDay === day && viewMode === 'daily'
                                ? 'text-luxury-emerald'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {activeDay === day && viewMode === 'daily' && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-x-4 bottom-1 h-0.5 bg-luxury-emerald shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                />
                            )}
                            <span className="relative z-10 font-outfit italic">{day.slice(0, 3)}</span>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[30px] opacity-0 group-hover/nav:opacity-5 transition-opacity font-black select-none pointer-events-none">{idx + 1}</span>
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
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start no-print"
                    >
                        {/* Summary Deck */}
                        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
                            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md p-10 shadow-2xl space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-outfit italic flex items-center gap-3">
                                        <div className="w-8 h-px bg-luxury-emerald"></div> Session Analytics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md group hover:border-luxury-emerald/30 transition-all">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Active Nodes</p>
                                            <p className="text-3xl font-black text-white font-outfit italic">0{dailySchedule.length}</p>
                                        </div>
                                        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Total Hours</p>
                                            <p className="text-3xl font-black text-white font-outfit italic">{(dailySchedule.length * 0.75).toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic mb-6">Subject Breakdown</h4>
                                    <div className="space-y-4">
                                        {Array.from(new Set(dailySchedule.map(s => s.subject?.name || 'Core'))).map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between text-[11px] font-bold text-slate-400 group cursor-pointer hover:text-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-md bg-luxury-emerald group-hover:scale-150 transition-transform"></div>
                                                    <span className="uppercase tracking-widest">{sub}</span>
                                                </div>
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-800/60">
                                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-md flex items-center gap-5 group cursor-help">
                                        <div className="p-3 bg-indigo-500/20 rounded text-indigo-400 group-hover:scale-110 transition-transform"><Layers size={18} /></div>
                                        <p className="text-[10px] font-black text-indigo-300 italic uppercase leading-relaxed tracking-wider">
                                            Synchronization confirmed with Faculty Server Lambda-09
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-luxury-emerald border border-white/10 p-1 rounded-md shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                <button className="w-full py-5 bg-[#0f0f12] hover:bg-slate-900 rounded-md text-luxury-emerald text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic group">
                                    Download Full Schedule <Download size={16} className="group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </aside>

                        {/* Timeline Feed */}
                        <div className="lg:col-span-8 space-y-8">
                            {dailySchedule.length > 0 ? (
                                <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-luxury-emerald before:via-slate-800 before:to-slate-950">
                                    {dailySchedule.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                                            onMouseEnter={() => setHoveredNode(idx)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className="group relative"
                                        >
                                            {/* Node Marker */}
                                            <div className={`absolute -left-[53px] top-6 w-10 h-10 rounded-md border-4 border-[#0f0f12] bg-[#0f0f12] flex items-center justify-center z-10 transition-all duration-500 ${hoveredNode === idx ? 'scale-125 border-luxury-emerald' : ''}`}>
                                                <div className={`w-3 h-3 rounded-md bg-gradient-to-tr ${getTimeIntensity(slot.startTime)} transition-all duration-700 ${hoveredNode === idx ? 'scale-150 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.8)]' : ''}`}></div>
                                            </div>

                                            {/* Period Card */}
                                            <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md hover:border-luxury-emerald/30 transition-all duration-700 relative overflow-hidden group/card shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                                <div className="absolute top-0 right-0 h-full w-[20%] bg-gradient-to-l from-white/5 to-transparent pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity"></div>

                                                <div className="flex flex-col md:flex-row gap-12 relative z-10">
                                                    {/* Time & Meta */}
                                                    <div className="md:w-48 space-y-6 shrink-0 border-r border-slate-800/60 pr-8">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-luxury-emerald mb-2">
                                                                <Clock size={16} className="animate-pulse" />
                                                                <span className="text-xl font-black italic tracking-tighter font-outfit uppercase">{slot.startTime}</span>
                                                            </div>
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-tight">Terminal Duration Until {slot.endTime}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-md border border-slate-800/60 group-hover/card:border-luxury-emerald/20 transition-all shadow-inner">
                                                            <MapPin size={16} className="text-luxury-emerald" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{slot.room || 'Sector-Alpha'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Subject & Faculty */}
                                                    <div className="flex-1 space-y-8">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-black text-luxury-emerald uppercase tracking-[0.5em] italic">Pedagogical Node 0{idx + 1}</span>
                                                                <div className="flex-1 h-px bg-slate-900"></div>
                                                            </div>
                                                            <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none group-hover/card:text-luxury-emerald transition-all duration-500">
                                                                {slot.subject?.name || 'Core Concept Exploration'}
                                                            </h4>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-md bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover/card:border-luxury-emerald/30 group-hover:text-luxury-emerald transition-all shadow-xl">
                                                                    <Users size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Faculty Authority</p>
                                                                    <p className="text-[13px] font-black text-white uppercase italic tracking-tight">{slot.teacher?.firstName} {slot.teacher?.lastName || 'Lead Educator'}</p>
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
                                <div className="py-48 text-center bg-[#0f0f12] rounded-md border border-dashed border-slate-800/60 shadow-inner group">
                                    <Calendar size={100} className="text-slate-900 mx-auto mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 opacity-20" />
                                    <h3 className="text-3xl font-black text-slate-700 uppercase tracking-[0.5em] font-outfit mb-4 italic">Node Quiescent</h3>
                                    <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed">No active pedagogical signals detected in this sector for {activeDay}.</p>
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
                        className="bg-[#0f0f12] border border-slate-800/60 rounded-md shadow-2xl p-1 no-print"
                    >
                        <div className="w-full">
                            <table className="w-full text-left border-separate border-spacing-1 table-fixed">
                                <thead>
                                    <tr>
                                        <th className="p-4 bg-black/40 rounded-md border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 italic font-outfit w-24">Timeline</th>
                                        {days.map(d => (
                                            <th key={d} className={`p-4 rounded-md border transition-all duration-500 text-center ${activeDay === d ? 'bg-luxury-emerald/10 border-luxury-emerald/40 text-luxury-emerald shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-slate-800 text-slate-500'}`}>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] font-outfit italic leading-none">{d.slice(0, 3)}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5, 6, 7].map(periodIndex => (
                                        <tr key={periodIndex}>
                                            <td className="p-4 bg-slate-950/40 rounded-md border border-slate-800 text-center">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Slot 0{periodIndex}</span>
                                            </td>
                                            {days.map(day => {
                                                const slot = timetable?.schedule?.find(s => s.day === day)?.periods[periodIndex - 1];
                                                return (
                                                    <td key={day} className={`p-4 rounded-md border relative transition-all duration-300 group/slot h-32 ${slot ? 'bg-slate-900/40 border-slate-800/80 hover:border-luxury-emerald/30 cursor-pointer shadow-xl' : 'bg-black/20 border-slate-900/40 opacity-40'}`}>
                                                        {slot ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`text-[8px] font-black italic uppercase tracking-widest ${slot.type === 'Break' ? 'text-amber-500' : 'text-luxury-emerald'}`}>{slot.startTime}</span>
                                                                    <div className={`w-1.5 h-1.5 rounded-sm bg-slate-700 group-hover/slot:bg-luxury-emerald animate-pulse ${slot.type === 'Break' ? 'group-hover/slot:bg-amber-500' : ''}`}></div>
                                                                </div>
                                                                <h5 className={`font-black italic uppercase tracking-tighter text-[11px] font-outfit line-clamp-1 transition-colors ${slot.type === 'Break' ? 'text-amber-500' : 'text-white group-hover/slot:text-luxury-emerald'}`}>
                                                                    {slot.type === 'Break' ? 'Break' : (slot.subject?.name || 'Subject')}
                                                                </h5>
                                                                <div className="flex flex-col gap-1 text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                                                                    {slot.type !== 'Break' ? (
                                                                        <>
                                                                            <span className="truncate italic group-hover/slot:text-slate-400">{slot.teacher?.lastName || 'Lead Educator'}</span>
                                                                            <span className="italic flex items-center gap-1"><MapPin size={8} /> RM {slot.room || 'A01'}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-amber-500/60 flex items-center gap-1 italic">Intermission</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full bg-slate-950/20 rounded border-dashed border border-slate-900/40"></div>
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

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full text-black bg-white p-2">
                <style>{`
                    @media print {
                        @page { margin: 1cm; size: landscape; }
                        body { background: white !important; color: black !important; }
                    }
                `}</style>
                <div className="mb-10 pb-6 border-b-2 border-slate-900 flex justify-between items-end">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Synchronized Academic Cycle</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] italic">Institutional Node Dispatch // 2026 Archive</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Temporal Anchor</p>
                        <p className="text-xl font-black italic">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-0 border-2 border-slate-900 divide-x-2 divide-slate-900 bg-white">
                    {days.map(day => (
                        <div key={day} className="flex flex-col">
                            <div className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest text-center italic border-b-2 border-slate-900">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 min-h-[600px]">
                                {(timetable?.schedule?.find(s => s.day === day)?.periods || []).map((slot, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 bg-slate-50 rounded space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-emerald-600 italic leading-none">{slot.startTime}</span>
                                            <span className="text-[8px] font-bold text-slate-400 italic">UNTIL {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[11px] font-black uppercase tracking-tight italic leading-tight text-black border-b border-slate-200 pb-2">
                                            {slot.subject?.name || slot.subject || 'Academic Node'}
                                        </h4>
                                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase italic">
                                            <span>{slot.teacher?.firstName || 'Staff'}</span>
                                            <span>RM: {slot.room || 'TBA'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-between items-center px-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase italic tracking-widest">Authorized Transmission Node // End of Sequence</p>
                    <p className="text-[8px] font-bold italic text-slate-600">Generated via School Operations Portal Core</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Timetable;
