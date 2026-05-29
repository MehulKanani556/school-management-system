import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchTeacherTimetable, fetchUnifiedCalendar, fetchProfile } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MapPin, BookOpen, Layers, Users, ChevronDown, Printer } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TeacherTimetable = () => {
    const dispatch = useDispatch();
    const { classes, timetable, unifiedCalendar, profile } = useSelector((state) => state.teacher);
    const { activeAcademicYear } = useSelector((state) => state.academicYear);
    const prevYearRef = useRef(activeAcademicYear);
    const [selectedClass, setSelectedClass] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');

    useEffect(() => {
        if (prevYearRef.current && prevYearRef.current !== activeAcademicYear) {
            setSelectedClass('');
        }
        prevYearRef.current = activeAcademicYear;
        dispatch(fetchAssignedClasses());
        dispatch(fetchUnifiedCalendar());
        dispatch(fetchProfile());
    }, [dispatch, activeAcademicYear]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchTeacherTimetable(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const dailySchedule = React.useMemo(() => {
        const teacherId = profile?._id?.toString();

        if (selectedClass) {
            const classDay = timetable?.schedule?.find(s => s.day === activeDay);
            if (!classDay) return [];
            return classDay.periods; // Show all periods of the class for context
        }

        if (!unifiedCalendar?.timetable || !teacherId) return [];

        let merged = [];
        unifiedCalendar.timetable.forEach(tt => {
            const daySchedule = tt.schedule.find(s => s.day === activeDay);
            if (daySchedule) {
                const teacherPeriods = daySchedule.periods
                    .filter(p => {
                        const pTeacherId = (p.teacher?._id || p.teacher)?.toString();
                        return pTeacherId === teacherId;
                    })
                    .map(p => ({
                        ...p,
                        contextLabel: `Grade ${tt.classSection?.standardId?.level || '—'}-${tt.classSection?.sectionLabel || '—'}`
                    }));
                merged = [...merged, ...teacherPeriods];
            }
        });

        return merged.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [selectedClass, timetable, unifiedCalendar, activeDay, profile]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-6">
            <div className="no-print space-y-6">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-slate-900/40 p-5 rounded-md border border-slate-800/60 shadow-xl backdrop-blur-xl group">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-6 h-[2px] bg-brand-primary rounded-md group-hover:w-12 transition-all duration-700"></span>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-primary font-outfit">Temporal Archive</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter uppercase font-outfit leading-none">Matrix <span className="text-brand-primary">Schedule</span></h1>
                        <p className="text-slate-500 font-bold text-[8px] uppercase tracking-widest italic opacity-50">Synchronized pedagogical node sequence.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        
                        <div className="relative group">
                            <Layers size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary" />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-slate-950/80 border border-slate-800 h-9 pl-10 pr-8 rounded-md text-[9px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white appearance-none cursor-pointer hover:bg-black font-outfit shadow-inner"
                            >
                                <option value="">Unified Matrix</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>Grade {c.standardId?.level || c.gradeLevel}-{c.sectionLabel}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                    </div>
                </header>

                <div className="space-y-4">
                    <div className="flex justify-start gap-1.5 bg-slate-900/40 p-1.5 rounded-md border border-slate-800/60 backdrop-blur-xl overflow-x-auto no-scrollbar scroll-smooth">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-5 py-2 whitespace-nowrap rounded-md text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${activeDay === day 
                                    ? 'bg-brand-primary text-white shadow-glow' 
                                    : 'text-slate-600 hover:text-slate-200'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-md p-5 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-md blur-[150px] -mr-60 -mt-60"></div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 font-outfit italic">Mapping: {activeDay}</h3>
                                <div className="px-3 py-1 bg-slate-900/80 rounded-md border border-slate-800 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-md bg-brand-primary animate-pulse shadow-glow"></div>
                                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{dailySchedule.length} active nodes</span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {dailySchedule.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {dailySchedule.map((slot, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="flex flex-col gap-3 p-4 bg-slate-900/40 border border-slate-800/50 rounded-md group hover:border-brand-primary/30 transition-all duration-300 cursor-default overflow-hidden relative shadow-inner"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-[30px] group-hover:bg-brand-primary/10 transition-colors"></div>

                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5 text-brand-primary mb-0.5">
                                                            <Clock size={12} />
                                                            <span className="text-lg font-black italic tracking-tighter font-outfit uppercase">{slot.startTime}</span>
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] ml-4">TO {slot.endTime}</span>
                                                    </div>
                                                    <div className="p-1.5 bg-slate-950/40 rounded-md border border-slate-800/40">
                                                        <MapPin size={10} className="text-brand-primary" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[8px] font-black text-brand-secondary uppercase tracking-[0.2em] italic">Sector</p>
                                                        {(slot.contextLabel || (selectedClass && timetable?.classSection)) && (
                                                            <span className="text-[8px] font-black bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-md border border-brand-primary/15">
                                                                {slot.contextLabel || `Grade ${timetable?.classSection?.standardId?.level || timetable?.classSection?.gradeLevel || '—'}-${timetable?.classSection?.sectionLabel || '—'}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-base font-black text-white italic tracking-tighter uppercase font-outfit leading-tight group-hover:text-brand-primary transition-colors truncate">{slot.subject?.name || slot.subject || 'Institutional Core'}</h4>
                                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/30">
                                                        <Users size={10} className="text-slate-600" />
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic truncate">{slot.teacher?.firstName || profile?.firstName} {slot.teacher?.lastName || profile?.lastName || 'Educator'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 tracking-[0.1em] italic pt-1 group-hover:text-slate-400 transition-colors">
                                                    <span className="text-brand-primary">RM:</span>
                                                    <span className="text-slate-300 uppercase truncate">{slot.room || 'S-Alpha'}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-24 text-center bg-slate-900/10 rounded-md border border-dashed border-slate-800/40"
                                    >
                                        <Calendar size={48} className="text-slate-800 mx-auto mb-4 opacity-10" />
                                        <h3 className="text-lg font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-1">Sector Inactive</h3>
                                        <p className="text-slate-700 text-[9px] font-bold uppercase tracking-widest italic">The academic sector is quiet for this temporal period.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View optimized for A4 */}
            <div className="print-only w-full text-black">
                <style>{`
                    @media print {
                        .print-only { display: block !important; }
                        .no-print { display: none !important; }
                    }
                `}</style>
                <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black uppercase italic">Academic Chronology</h1>
                        <p className="text-xs font-bold uppercase italic mt-1">{profile?.firstName} {profile?.lastName} — Lead Educator</p>
                    </div>
                    <div className="text-right text-[10px] font-bold italic uppercase">
                        Archive Date: {new Date().toLocaleDateString('en-GB')}
                    </div>
                </div>

                <div className="grid grid-cols-6 border-t border-l border-black">
                    {days.map(day => (
                        <div key={day} className="border-r border-b border-black">
                            <div className="bg-slate-100 p-2 text-center text-[10px] font-black uppercase border-b border-black">{day}</div>
                            <div className="p-2 space-y-3 min-h-[400px]">
                                {(timetable?.schedule?.find(s => s.day === day)?.periods || []).map((slot, idx) => (
                                    <div key={idx} className="p-2 border border-slate-200 text-[9px]">
                                        <div className="font-black text-brand-primary">{slot.startTime} - {slot.endTime}</div>
                                        <div className="font-black uppercase truncate mt-0.5">{slot.subject?.name || slot.subject}</div>
                                        <div className="text-slate-500 italic uppercase">RM: {slot.room}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default TeacherTimetable;
