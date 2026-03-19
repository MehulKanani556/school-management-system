import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchSubjects, fetchTeachers, fetchTimetable, saveTimetable, fetchAllTimetables, clearError } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Save, Calendar, Users, BookOpen, Layers, Edit2, Check, X, AlertCircle, LayoutGrid, List, Table as TableIcon, ChevronRight, ChevronDown, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetable = () => {
    const dispatch = useDispatch();
    const { classes, subjects, teachers, timetable, timetables, loading, error } = useSelector((state) => state.schoolAdmin);

    const [selectedClass, setSelectedClass] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');
    const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'table'
    const [schedule, setSchedule] = useState({}); // { Monday: [periods], ... }

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchTeachers());
        dispatch(fetchAllTimetables());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchTimetable(selectedClass));
        }
    }, [selectedClass, dispatch]);

    useEffect(() => {
        if (timetable && timetable.classSection === selectedClass) {
            const newSchedule = {};
            days.forEach(day => {
                const dayData = timetable.schedule.find(s => s.day === day);
                newSchedule[day] = dayData ? dayData.periods.map(p => ({
                    ...p,
                    subject: p.subject?._id || p.subject,
                    teacher: p.teacher?._id || p.teacher
                })) : [];
            });
            setSchedule(newSchedule);
        } else {
            const emptySchedule = {};
            days.forEach(day => { emptySchedule[day] = []; });
            setSchedule(emptySchedule);
        }
    }, [timetable, selectedClass]);

    const addPeriod = () => {
        const newPeriod = { startTime: '09:00', endTime: '10:00', subject: '', teacher: '', room: '' };
        setSchedule({
            ...schedule,
            [activeDay]: [...(schedule[activeDay] || []), newPeriod]
        });
    };

    const removePeriod = (index) => {
        const updatedPeriods = schedule[activeDay].filter((_, i) => i !== index);
        setSchedule({ ...schedule, [activeDay]: updatedPeriods });
    };

    const updatePeriod = (index, field, value) => {
        const updatedPeriods = [...schedule[activeDay]];
        updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
        setSchedule({ ...schedule, [activeDay]: updatedPeriods });
    };

    const handleSave = () => {
        if (!selectedClass) return toast.error('Select a class sector to synchronize');

        const scheduleArray = Object.keys(schedule).map(day => ({
            day,
            periods: schedule[day].filter(p => p.subject && p.teacher)
        }));

        dispatch(saveTimetable({ classSection: selectedClass, schedule: scheduleArray }))
            .unwrap()
            .then(() => {
                toast.success('Institutional chronology synchronized');
                dispatch(fetchAllTimetables());
            })
            .catch((err) => toast.error(err.message || 'Synchronization failed'));
    };

    const getExistingTimetable = (classId) => {
        return timetables.find(t => t.classSection?._id === classId || t.classSection === classId);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="no-print space-y-12">
                <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 bg-slate-900/40 p-12 rounded-[4rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent"></div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-16 h-[2px] bg-brand-primary rounded-full group-hover:w-24 transition-all duration-700"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary font-outfit">Temporal Management Engine</span>
                    </div>
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit text-shadow-glow">
                        Scheduling Terminal
                    </h1>
                    <p className="text-slate-500 font-medium text-sm tracking-widest italic flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                        Administrative archival of sector chronologies and pedagogical sequences.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 relative z-10">
                    <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
                        <button 
                            onClick={() => setViewMode('editor')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'editor' ? 'bg-brand-primary text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Edit2 size={14} /> Node Editor
                        </button>
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-brand-primary text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <TableIcon size={14} /> Global Registry
                        </button>
                    </div>

                    <div className="relative group">
                        <Layers size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within:scale-110 transition-transform" />
                        <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="bg-slate-950/80 border border-slate-800 h-16 pl-16 pr-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-brand-primary/50 transition-all text-white appearance-none cursor-pointer hover:bg-black font-outfit shadow-2xl"
                        >
                            <option value="">Identify Sector</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>Grade {c.gradeLevel} - {c.sectionLabel} {getExistingTimetable(c._id) ? '✓' : '○'}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <button 
                        onClick={() => window.print()}
                        disabled={!selectedClass && viewMode === 'editor'}
                        className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-brand-primary/40 text-slate-400 hover:text-brand-primary px-8 h-16 rounded-2xl font-black tracking-[0.3em] uppercase text-[11px] transition-all active:scale-95 font-outfit italic"
                    >
                        <Printer size={20} className="group-hover:scale-110 transition-transform" />
                        Broadcast
                    </button>

                    <button 
                        onClick={handleSave}
                        disabled={loading || !selectedClass}
                        className="group flex items-center gap-4 bg-brand-primary hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-brand-primary text-white px-10 h-16 rounded-2xl font-black tracking-[0.3em] uppercase text-[11px] transition-all shadow-glow active:scale-95 font-outfit italic"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                        Sync Timeline
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">Institutional Chronology Archive</h2>
                            <span className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary uppercase tracking-widest italic">{timetables.length} Active Records</span>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800/60 bg-slate-900/40">
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Academic Sector</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Node Density</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((cls) => {
                                        const tt = getExistingTimetable(cls._id);
                                        const periodCount = tt ? tt.schedule.reduce((acc, curr) => acc + curr.periods.length, 0) : 0;
                                        
                                        return (
                                            <tr key={cls._id} className="border-b border-slate-800/40 last:border-none group hover:bg-white/5 transition-all duration-500">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${tt ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-slate-900/60 border-slate-800 text-slate-600'}`}>
                                                            <Layers size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-white uppercase tracking-wider font-outfit italic">Grade {cls.gradeLevel} - {cls.sectionLabel}</div>
                                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Unit Path</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    {tt ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                                                            Synchronized
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                                            Awaiting Node Initialization
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="text-[12px] font-black text-slate-300 font-outfit italic">{periodCount} <span className="text-slate-600 text-[10px] ml-1 uppercase">Sequences</span></div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button 
                                                        onClick={() => { setSelectedClass(cls._id); setViewMode('editor'); }}
                                                        className="h-12 px-8 rounded-xl border border-slate-800 bg-slate-900/60 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 transition-all flex items-center justify-center gap-3 float-right group/btn"
                                                    >
                                                        {tt ? 'Modify' : 'Initialize'}
                                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {selectedClass ? (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                                {/* Day Selection Sidebar */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit px-2 italic flex items-center gap-3">
                                        <Calendar size={14} className="text-brand-primary" />
                                        Temporal Node
                                    </h3>
                                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-[3rem] p-5 shadow-2xl overflow-hidden backdrop-blur-md relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        {days.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => setActiveDay(day)}
                                                className={`w-full flex items-center justify-between px-8 py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 mb-3 last:mb-0 relative z-10 ${
                                                    activeDay === day 
                                                    ? 'bg-brand-primary text-white shadow-glow translate-x-2' 
                                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/80 hover:translate-x-1'
                                                }`}
                                            >
                                                {day}
                                                <div className={`w-2.5 h-2.5 rounded-full border-2 ${activeDay === day ? 'bg-white border-white shadow-[0_0_12px_#fff]' : 'bg-transparent border-slate-700'}`}></div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Quick Summary Card */}
                                    <div className="bg-gradient-to-br from-brand-primary/20 to-transparent border border-brand-primary/20 rounded-[2.5rem] p-8 space-y-4">
                                        <div className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">Sector Capacity</div>
                                        <div className="text-3xl font-black text-white font-outfit italic tracking-tighter">
                                            {schedule[activeDay]?.length || 0} / 8
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((schedule[activeDay]?.length || 0) / 8) * 100}%` }}
                                                className="bg-brand-primary h-full shadow-glow"
                                            ></motion.div>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Day sequences utilized in this sector</p>
                                    </div>
                                </div>

                                {/* Periods Editor */}
                                <div className="lg:col-span-3 space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">Sequence Map:</span>
                                                <span className="text-xl font-black text-white font-outfit italic uppercase tracking-widest">{activeDay}</span>
                                            </div>
                                            <div className="h-4 w-[1px] bg-slate-800"></div>
                                            <span className="px-5 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary uppercase tracking-widest italic shadow-inner">
                                                {schedule[activeDay]?.length || 0} Pulse points
                                            </span>
                                        </div>
                                        <button 
                                            onClick={addPeriod}
                                            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-primary italic hover:gap-5 transition-all bg-brand-primary/5 px-6 py-3 rounded-xl border border-brand-primary/10 hover:border-brand-primary/40"
                                        >
                                            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
                                            Add Pedagogical Node
                                        </button>
                                    </div>

                                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-luxury">
                                        <AnimatePresence mode="popLayout">
                                            {schedule[activeDay]?.map((period, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    layout
                                                    initial={{ opacity: 0, x: -30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                                    className="bg-slate-950/60 border border-slate-800/80 rounded-[3rem] p-10 group hover:border-brand-primary/40 transition-all duration-700 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-60 h-60 bg-brand-primary/5 rounded-full blur-[100px] -mr-30 -mt-30 group-hover:bg-brand-primary/10 transition-colors"></div>
                                                    
                                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-end relative z-10">
                                                        {/* Time Sequence */}
                                                        <div className="xl:col-span-3 space-y-5">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={12} className="text-brand-primary" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Slot</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-inner group-hover:border-slate-700 transition-colors">
                                                                <input 
                                                                    type="time" 
                                                                    value={period.startTime}
                                                                    onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)}
                                                                    className="bg-transparent text-white text-[13px] font-black outline-none w-full font-outfit tracking-wider"
                                                                />
                                                                <div className="w-[1px] h-4 bg-slate-800"></div>
                                                                <input 
                                                                    type="time" 
                                                                    value={period.endTime}
                                                                    onChange={(e) => updatePeriod(idx, 'endTime', e.target.value)}
                                                                    className="bg-transparent text-white text-[13px] font-black outline-none w-full font-outfit tracking-wider"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Subject Node */}
                                                        <div className="xl:col-span-4 space-y-5">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen size={12} className="text-brand-primary" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Knowledge Node</span>
                                                            </div>
                                                            <div className="relative">
                                                                <select 
                                                                    value={period.subject}
                                                                    onChange={(e) => updatePeriod(idx, 'subject', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-800 h-16 px-8 rounded-2xl text-[12px] font-black uppercase text-white outline-none focus:border-brand-primary/60 transition-all font-outfit appearance-none italic shadow-inner group-hover:border-slate-700"
                                                                >
                                                                    <option value="">Identify Subject</option>
                                                                    {subjects.map(s => (
                                                                        <option key={s._id} value={s._id}>{s.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                            </div>
                                                        </div>

                                                        {/* Teacher Node */}
                                                        <div className="xl:col-span-3 space-y-5">
                                                            <div className="flex items-center gap-2">
                                                                <Users size={12} className="text-brand-primary" />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Assigned Educator</span>
                                                            </div>
                                                            <div className="relative">
                                                                <select 
                                                                    value={period.teacher}
                                                                    onChange={(e) => updatePeriod(idx, 'teacher', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-800 h-16 px-8 rounded-2xl text-[12px] font-black uppercase text-white outline-none focus:border-brand-primary/60 transition-all font-outfit appearance-none italic shadow-inner group-hover:border-slate-700"
                                                                >
                                                                    <option value="">Assign Educator</option>
                                                                    {teachers.map(t => (
                                                                        <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                                            </div>
                                                        </div>

                                                        {/* Room & Actions */}
                                                        <div className="xl:col-span-2 flex items-center gap-5">
                                                            <div className="flex-1 space-y-5">
                                                                <div className="flex items-center gap-2">
                                                                    <Layers size={12} className="text-brand-primary" />
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Sector ID</span>
                                                                </div>
                                                                <input 
                                                                    placeholder="C-101"
                                                                    value={period.room}
                                                                    onChange={(e) => updatePeriod(idx, 'room', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-800 h-16 px-8 rounded-2xl text-[12px] font-black uppercase text-white outline-none focus:border-brand-primary/60 transition-all font-outfit italic shadow-inner group-hover:border-slate-700"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => removePeriod(idx)}
                                                                className="w-16 h-16 mt-14 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-600 hover:text-luxury-rose hover:border-luxury-rose/30 hover:bg-luxury-rose/5 transition-all flex items-center justify-center shadow-xl active:scale-90 group/trash"
                                                            >
                                                                <Trash2 size={22} className="group-hover/trash:scale-110 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {(!schedule[activeDay] || schedule[activeDay].length === 0) && (
                                            <div className="py-48 border-2 border-dashed border-slate-800/40 rounded-[5rem] bg-slate-900/20 text-center flex flex-col items-center justify-center space-y-8 backdrop-blur-sm group/empty transition-all duration-1000 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]"></div>
                                                <div className="relative">
                                                    <Clock size={70} className="text-slate-800 opacity-20 animate-pulse-slow mb-8 mx-auto group-hover/empty:scale-110 group-hover/empty:text-brand-primary/20 transition-all duration-1000" />
                                                    <div>
                                                        <h4 className="text-slate-600 font-black uppercase tracking-[0.6em] text-[13px] italic font-outfit">Empty Temporal Node</h4>
                                                        <p className="text-slate-700 text-[11px] mt-4 font-bold tracking-[0.3em] uppercase italic bg-slate-900/60 inline-block px-8 py-3 rounded-full border border-slate-800/50">Initialize pedagogical sequences for {activeDay}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={addPeriod}
                                                    className="relative bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-brand-primary/20 hover:border-brand-primary/40 active:scale-95 group-hover/empty:shadow-glow"
                                                >
                                                    Apply First Pulse Points
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/40 rounded-[6rem] bg-slate-900/20 backdrop-blur-md group hover:border-brand-primary/10 transition-all duration-1000 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_80%)] animate-pulse-slow"></div>
                                <Calendar size={120} className="text-slate-800 mb-14 opacity-20 group-hover:scale-125 group-hover:rotate-6 group-hover:text-brand-primary/20 transition-all duration-1000 relative z-10" />
                                <h3 className="text-4xl font-black text-slate-700 uppercase tracking-[0.5em] font-outfit italic text-center relative z-10">Sector Link Required</h3>
                                <div className="mt-10 flex flex-col items-center gap-6 relative z-10">
                                    <p className="text-slate-500 text-[13px] font-black tracking-[0.3em] uppercase italic border-t border-slate-800/60 pt-6">Select an academic sector to access institutional chronology</p>
                                    <div className="flex gap-4">
                                        {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-primary/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Metrics */}
            {selectedClass && (
                <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-brand-primary/20 transition-all">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-brand-primary border border-slate-800 group-hover:scale-110 transition-transform">
                            <Layers size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Target Sector</div>
                            <div className="text-xl font-black text-white font-outfit italic uppercase">Grade {classes.find(c => c._id === selectedClass)?.gradeLevel} - {classes.find(c => c._id === selectedClass)?.sectionLabel}</div>
                        </div>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-emerald-500/20 transition-all">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-emerald-500 border border-slate-800 group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Sync Latency</div>
                            <div className="text-xl font-black text-white font-outfit italic uppercase">Real-Time</div>
                        </div>
                    </div>
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-brand-primary/20 transition-all">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-brand-primary border border-slate-800 group-hover:scale-110 transition-transform">
                            <Check size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Node Validation</div>
                            <div className="text-xl font-black text-white font-outfit italic uppercase">Sector Secure</div>
                        </div>
                    </div>
                </footer>
            )}
            </div>

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full">
                <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Institutional Chronology</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">Sector: Grade {classes.find(c => c._id === selectedClass)?.gradeLevel || 'X'}-{classes.find(c => c._id === selectedClass)?.sectionLabel || 'A'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Temporal Dispatch Archive</p>
                        <p className="text-lg font-black italic">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 border-2 border-slate-900 divide-x-2 divide-slate-900 rounded-2xl overflow-hidden">
                    {days.map(day => (
                        <div key={day} className="flex flex-col">
                            <div className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest text-center italic border-b-2 border-slate-900">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 min-h-[600px]">
                                {(schedule[day] || []).map((slot, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-brand-primary italic">{slot.startTime}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">TO {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tighter italic leading-tight">
                                            {subjects.find(s => s._id === slot.subject)?.name || 'Pedagogical Node'}
                                        </h4>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic truncate">
                                            {teachers.find(t => t._id === slot.teacher)?.firstName || 'Educator'}
                                        </p>
                                        <div className="text-[8px] font-black text-slate-400 uppercase italic">RM: {slot.room || 'Sector-A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">© 2026 Admin Chronology Terminal</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Institutional Authorization Required for Distribution</div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminTimetable;
