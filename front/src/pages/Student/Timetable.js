import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTimetable } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MapPin, BookOpen, Layers } from 'lucide-react';

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

    const dailySchedule = timetable?.filter(item => item.day === activeDay) || [];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Temporal Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Institutional schedule & temporal coordinates.</p>
                </div>
                <div className="flex bg-[#0f0f12] p-2 rounded-2xl border border-slate-800 shadow-2xl overflow-x-auto no-scrollbar">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeDay === day 
                                ? 'bg-luxury-emerald text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                : 'text-slate-500 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-emerald/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    
                    <div className="space-y-6 relative z-10">
                        <AnimatePresence mode="wait">
                            {dailySchedule.length > 0 ? (
                                dailySchedule.map((slot, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex flex-col md:flex-row md:items-center gap-6 p-8 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] group hover:border-luxury-emerald/30 transition-all hover:translate-x-2"
                                    >
                                        <div className="md:w-32 flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2 text-luxury-emerald">
                                                <Clock size={14} />
                                                <span className="text-[12px] font-black uppercase tracking-tighter font-outfit">{slot.startTime}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-5">TO {slot.endTime}</span>
                                        </div>

                                        <div className="w-px h-12 bg-slate-800 hidden md:block"></div>

                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-brand-secondary uppercase tracking-[0.3em] mb-1 italic">Subject Node</p>
                                            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase font-outfit group-hover:text-luxury-emerald transition-colors">{slot.subject || 'Core Discovery'}</h4>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-3 bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700/50">
                                                <MapPin size={14} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{slot.room || 'Sector-01'}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-luxury-emerald group-hover:border-luxury-emerald/50 transition-all">
                                                <Layers size={18} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 text-center"
                                >
                                    <Calendar size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                                    <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">No Scheduled Pulses</h3>
                                    <p className="text-slate-700 text-xs font-bold uppercase tracking-widest italic">The academic sector is quiet for this temporal period.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Timetable;
