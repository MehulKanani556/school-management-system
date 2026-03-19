import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchTeacherTimetable } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MapPin, BookOpen, Layers, Users, ChevronDown, Printer } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherTimetable = () => {
    const dispatch = useDispatch();
    const { classes, timetable, loading } = useSelector((state) => state.teacher);
    const [selectedClass, setSelectedClass] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchTeacherTimetable(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const dailySchedule = timetable?.schedule?.find(s => s.day === activeDay)?.periods || [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="no-print space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 bg-slate-900/40 p-10 rounded-[3.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl group">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-12 h-[2px] bg-brand-primary rounded-full group-hover:w-20 transition-all duration-700"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Instructional Chronology</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit text-shadow-glow">Temporal Sector</h1>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl italic">Visual archival of sectoral pedagogical nodes and educator assignments.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => window.print()}
                            className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-brand-primary/40 text-slate-400 hover:text-brand-primary px-8 h-16 rounded-[2rem] font-black tracking-[0.3em] uppercase text-[11px] transition-all active:scale-95 font-outfit italic"
                        >
                            <Printer size={20} className="group-hover:scale-110 transition-transform" />
                            Broadcast
                        </button>
                        <div className="relative group">
                            <Layers size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-slate-950/80 border border-slate-800 h-14 pl-14 pr-10 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white appearance-none cursor-pointer hover:bg-black font-outfit shadow-inner"
                            >
                                <option value="">Identify Sector</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>Grade {c.gradeLevel} - {c.sectionLabel}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                    </div>
                </header>

                {selectedClass ? (
                    <div className="space-y-10">
                        <div className="bg-black/40 p-2.5 rounded-[2.5rem] border border-slate-800/80 shadow-2xl overflow-x-auto no-scrollbar backdrop-blur-md self-start inline-flex">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeDay === day
                                            ? 'bg-brand-primary text-white shadow-glow translate-y-[-2px]'
                                            : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[150px] -mr-60 -mt-60"></div>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between px-4 mb-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">Sequence Map: {activeDay}</h3>
                                    <div className="px-5 py-2 bg-slate-900/80 rounded-full border border-slate-800 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-glow"></div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{dailySchedule.length} pedagogical nodes</span>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {dailySchedule.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {dailySchedule.map((slot, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.08 }}
                                                    className="flex flex-col gap-8 p-10 bg-slate-900/40 border border-slate-800/50 rounded-[3rem] group hover:border-brand-primary/40 transition-all duration-700 hover:shadow-2xl cursor-default overflow-hidden relative"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[40px] group-hover:bg-brand-primary/10 transition-colors"></div>

                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-3 text-brand-primary mb-1">
                                                                <Clock size={16} />
                                                                <span className="text-xl font-black italic tracking-tighter font-outfit uppercase shadow-glow">{slot.startTime}</span>
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-7">TO {slot.endTime}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em] mb-1 italic">Pedagogical Node</p>
                                                        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1 group-hover:text-brand-primary transition-colors">{slot.subject?.name || slot.subject || 'Core Discovery'}</h4>
                                                        <div className="flex items-center gap-3 pt-2">
                                                            <Users size={12} className="text-slate-600" />
                                                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">{slot.teacher?.firstName} {slot.teacher?.lastName || 'Assigned Educator'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800/40 border-dashed">
                                                        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 shadow-xl">
                                                            <MapPin size={12} className="text-brand-primary" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{slot.room || 'Sector-Alpha'}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-48 text-center bg-slate-900/10 rounded-[4rem] border-2 border-dashed border-slate-800/40"
                                        >
                                            <Calendar size={80} className="text-slate-800 mx-auto mb-10 opacity-20" />
                                            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-[0.4em] font-outfit mb-4">No Sector Pulses</h3>
                                            <p className="text-slate-700 text-[11px] font-bold uppercase tracking-widest italic">The academic sector is quiet for this temporal period.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-60 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/40 rounded-[5rem] bg-slate-900/20 backdrop-blur-sm group hover:border-brand-primary/10 transition-all duration-1000">
                        <Calendar size={80} className="text-slate-800 mb-10 opacity-20 group-hover:scale-110 group-hover:text-brand-primary/20 transition-all duration-1000" />
                        <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.4em] font-outfit italic text-center">Sector Identification Required</h3>
                        <p className="text-slate-800 text-[11px] mt-4 font-bold tracking-[0.2em] uppercase italic bg-slate-900/40 px-6 py-2 rounded-full border border-slate-800/50">Select an academic sector to access institutional chronology</p>
                    </div>
                )}
            </div>

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full">
                <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Institutional Chronology</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">Teacher Activity Archive</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Temporal Dispatch Archive</p>
                        <p className="text-lg font-black italic">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 border-2 border-slate-900 divide-x-2 divide-slate-900 rounded-2xl overflow-hidden text-black">
                    {days.map(day => (
                        <div key={day} className="flex flex-col">
                            <div className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest text-center italic border-b-2 border-slate-900">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 min-h-[600px] bg-white text-black">
                                {(timetable?.schedule?.find(s => s.day === day)?.periods || []).map((slot, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-brand-primary italic">{slot.startTime}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">TO {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tighter italic leading-tight text-black">
                                            {slot.subject?.name || slot.subject || 'Pedagogical Node'}
                                        </h4>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic truncate">
                                            {slot.teacher?.firstName || 'Lead Educator'}
                                        </p>
                                        <div className="text-[8px] font-black text-slate-400 uppercase italic">RM: {slot.room || 'Sector-A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">© 2026 Institutional Chronology Terminal</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Authorized Academic Record — Teacher Copy</div>
                </div>
            </div>
        </motion.div>
    );
};

export default TeacherTimetable;
