import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTimetable } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MapPin, BookOpen, Layers, Users, Printer } from 'lucide-react';

const Timetable = () => {
    const dispatch = useDispatch();
    const { timetable, loading } = useSelector((state) => state.student);
    const [activeDay, setActiveDay] = useState('');

    useEffect(() => {
        dispatch(fetchStudentTimetable());
    }, [dispatch]);

    // Grouping logic (if timetable is flat list of { day, ... })
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    useEffect(() => {
        if (timetable && timetable.length > 0) {
            setActiveDay(timetable[0].day || 'Monday');
        } else {
            setActiveDay('Monday');
        }
    }, [timetable]);

    const dailySchedule = timetable?.schedule?.find(s => s.day === activeDay)?.periods || [];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="no-print space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 bg-slate-900/40 p-10 rounded-[3.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl group">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-emerald rounded-full group-hover:w-20 transition-all duration-700"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-emerald font-outfit">Temporal Coordinates</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit text-shadow-glow">Institutional Pulse</h1>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl italic">Digital archival of your synchronized pedagogical sequences and academic cycles.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <button 
                        onClick={() => window.print()}
                        className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-luxury-emerald/40 text-slate-400 hover:text-luxury-emerald px-8 h-16 rounded-[2rem] font-black tracking-[0.3em] uppercase text-[11px] transition-all active:scale-95 font-outfit italic"
                    >
                        <Printer size={20} className="group-hover:scale-110 transition-transform" />
                        Broadcast
                    </button>

                    <div className="flex bg-black/40 p-2.5 rounded-[2rem] border border-slate-800/80 shadow-inner overflow-x-auto no-scrollbar backdrop-blur-md">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                                    activeDay === day 
                                    ? 'bg-luxury-emerald text-black shadow-glow translate-y-[-2px]' 
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                                }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-12">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-[4rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-luxury-emerald/5 rounded-full blur-[150px] -mr-60 -mt-60"></div>
                    
                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center justify-between px-4 mb-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">Sequence Map: {activeDay}</h3>
                            <div className="px-5 py-2 bg-slate-900/80 rounded-full border border-slate-800 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-luxury-emerald animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{dailySchedule.length} active nodes</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {dailySchedule.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dailySchedule.map((slot, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.08, type: 'spring', damping: 20 }}
                                            className="flex flex-col gap-8 p-10 bg-slate-900/40 border border-slate-800/50 rounded-[3rem] group hover:border-luxury-emerald/40 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-default overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-emerald/5 blur-[40px] group-hover:bg-luxury-emerald/10 transition-colors"></div>
                                            
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3 text-luxury-emerald mb-1">
                                                        <Clock size={16} className="group-hover:rotate-12 transition-transform" />
                                                        <span className="text-xl font-black italic tracking-tighter font-outfit uppercase shadow-glow">{slot.startTime}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-7">Synchronized until {slot.endTime}</span>
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-luxury-emerald shadow-inner group-hover:scale-110 group-hover:border-luxury-emerald/30 transition-all duration-700">
                                                    <BookOpen size={24} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em] mb-1 italic">Pedagogical Node</p>
                                                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1 group-hover:text-luxury-emerald transition-colors">{slot.subject?.name || slot.subject || 'Core Discovery'}</h4>
                                                <div className="flex items-center gap-3 pt-2">
                                                    <Users size={12} className="text-slate-600" />
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">{slot.teacher?.firstName} {slot.teacher?.lastName || 'Lead Educator'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4 border-t border-slate-800/40 border-dashed">
                                                <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl group-hover:border-luxury-emerald/20 transition-all">
                                                    <MapPin size={14} className="text-luxury-emerald" />
                                                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">{slot.room || 'Sector-Alpha'}</span>
                                                </div>
                                                <div className="flex-1"></div>
                                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-luxury-emerald group-hover:border-luxury-emerald/30 transition-all">
                                                    <Layers size={16} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-48 text-center bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-800/40"
                                >
                                    <Calendar size={80} className="text-slate-800 mx-auto mb-10 opacity-20 animate-pulse" />
                                    <h3 className="text-2xl font-black text-slate-600 uppercase tracking-[0.4em] font-outfit mb-4">No Scheduled Pulses</h3>
                                    <p className="text-slate-700 text-[11px] font-bold uppercase tracking-widest italic bg-slate-900/50 px-8 py-2 rounded-full border border-slate-800/50 inline-block">The academic sector is quiet for this temporal period.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                </div>
            </div>

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full">
                <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Institutional Chronology</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">Institutional Pulse Archive</p>
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
                            <div className="p-4 space-y-4 min-h-[600px] bg-white">
                                {(timetable?.schedule?.find(s => s.day === day)?.periods || []).map((slot, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-luxury-emerald italic">{slot.startTime}</span>
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
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Authorized Academic Record — Archival Copy</div>
                </div>
            </div>
        </motion.div>
    );
};

export default Timetable;
