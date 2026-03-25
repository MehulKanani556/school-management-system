import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildTimetable } from '../../redux/slice/parent.slice';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Coffee, User } from 'lucide-react';

const ChildTimetable = () => {
    const dispatch = useDispatch();
    const { selectedChild, timetable, loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildTimetable(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = Array.from({ length: 8 }, (_, i) => ({
        start: `${9 + i}:00`,
        end: `${10 + i}:00`
    }));

    if (loading && !timetable) {
        return <div className="flex items-center justify-center pt-20 animate-pulse text-luxury-rose">INITIALizing SCHEDULE SYNC...</div>;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-rose rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-rose">Daily Sequence</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Academic Timetable</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Operational schedule for <span className="text-white font-bold">{selectedChild?.firstName}</span>'s current term.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 px-8 rounded-md shadow-inner opacity-60">
                    <Calendar size={24} className="text-luxury-rose" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Standard</p>
                        <p className="text-sm font-black text-white">{selectedChild?.standard?.name} // {selectedChild?.classSection?.name}</p>
                    </div>
                </div>
            </header>

            <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60">
                                <th className="p-6 border border-brand-border/20 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic bg-black/20 w-32 sticky left-0 z-10 backdrop-blur-md">Timeline</th>
                                {days.map(day => (
                                    <th key={day} className="p-6 border border-brand-border/20 text-[11px] font-black uppercase tracking-[0.3em] text-white">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((slot, rowIndex) => (
                                <tr key={rowIndex} className="group">
                                    <td className="p-6 border border-brand-border/20 bg-slate-900/40 sticky left-0 z-10 backdrop-blur-md">
                                        <div className="flex flex-col items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black text-white tracking-widest">{slot.start}</span>
                                            <div className="w-[1px] h-3 bg-luxury-rose" />
                                            <span className="text-[10px] font-black text-slate-500 tracking-widest">{slot.end}</span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const dayData = timetable?.days?.find(d => d.day === day);
                                        const session = dayData?.slots?.find(s => s.startTime === slot.start);
                                        const isBreak = session?.type === 'Break';

                                        return (
                                            <td key={day} className={`p-4 border border-brand-border/20 transition-all duration-300 relative group/cell min-w-[180px] ${isBreak ? 'bg-parent-primary/5' : session ? 'hover:bg-white/[0.03]' : 'opacity-10'}`}>
                                                {session ? (
                                                    <div className="relative z-10">
                                                        {isBreak ? (
                                                            <div className="flex flex-col items-center justify-center py-4 bg-parent-primary/10 border border-parent-primary/20 rounded-md">
                                                                <Coffee className="text-parent-primary/50 mb-2" size={24} />
                                                                <span className="text-[10px] font-black text-parent-primary uppercase tracking-[0.4em]">Intermission</span>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <BookOpen size={14} className="text-luxury-rose" />
                                                                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{session.subject?.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <User size={12} className="text-slate-400" />
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        {session.teacher?.firstName} {session.teacher?.lastName}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 opacity-40">
                                                                    <Clock size={11} className="text-slate-500" />
                                                                    <span className="text-[8px] font-bold text-slate-500 tracking-[0.2em]">{session.startTime} - {session.endTime}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-20 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                        <span className="text-[8px] font-black uppercase text-slate-800 tracking-widest">Unscheduled</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default ChildTimetable;
