import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchSubjects, fetchTeachers, fetchTimetable, saveTimetable, fetchAllTimetables, clearError, fetchTimetableTemplates, createTimetableTemplate, updateTimetableTemplate, deleteTimetableTemplate } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Save, Calendar, Users, BookOpen, Layers, Edit2, Check, X, AlertCircle, LayoutGrid, List, Table as TableIcon, ChevronRight, ChevronDown, Printer, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetable = () => {
    const dispatch = useDispatch();
    const [selectedClass, setSelectedClass] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');
    const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'table'
    const [schedule, setSchedule] = useState({}); // { Monday: [periods], ... }
    
    // Template Management States
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isTemplateEditModalOpen, setIsTemplateEditModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [templateName, setTemplateName] = useState('');
    const [templatePeriods, setTemplatePeriods] = useState([]);
    const [templateDurations, setTemplateDurations] = useState({
        Lecture: 45,
        Break: 15,
        'Short Break': 10,
        'Long Break': 30
    });
    const { classes, subjects, teachers, timetable, timetables, timetableTemplates, loading, error } = useSelector((state) => state.schoolAdmin);

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchTeachers());
        dispatch(fetchAllTimetables());
        dispatch(fetchTimetableTemplates());
    }, [dispatch]);

    const cascadePeriods = (periods, durations, startIndex = 0) => {
        const updated = periods.map(p => ({ ...p }));
        for (let i = startIndex; i < updated.length; i++) {
            if (i > 0) {
                updated[i].startTime = updated[i-1].endTime;
            }
            
            const duration = durations[updated[i].type] || 45;
            const [sh, sm] = updated[i].startTime.split(':').map(Number);
            const totalMinutes = sh * 60 + sm + duration;
            const nh = Math.floor(totalMinutes / 60) % 24;
            const nm = totalMinutes % 60;
            updated[i].endTime = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
        }
        return updated;
    };

    useEffect(() => {
        if (templatePeriods.length > 0) {
            setTemplatePeriods(cascadePeriods(templatePeriods, templateDurations));
        }
    }, [templateDurations]);

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
        const lastPeriod = activeDay && schedule[activeDay] && schedule[activeDay].length > 0 
            ? schedule[activeDay][schedule[activeDay].length - 1] 
            : null;
        
        const startTime = lastPeriod ? lastPeriod.endTime : '09:00';
        let endTime = '10:00';
        if (lastPeriod) {
            const [h, m] = lastPeriod.endTime.split(':').map(Number);
            endTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        const newPeriod = { startTime, endTime, subject: '', teacher: '', room: '', type: 'Lecture' };
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
        let updatedPeriods = [...schedule[activeDay]];
        const updatedPeriod = { ...updatedPeriods[index], [field]: value };

        // If subject changes, validate/reset teacher
        if (field === 'subject') {
            const currentClass = classes.find(c => c._id === selectedClass);
            const assignment = currentClass?.subjectAssignments?.find(a => (a.subject?._id || a.subject) === value);
            const allowedTeacherIds = assignment?.teachers?.map(t => t._id || t) || [];
            
            if (!allowedTeacherIds.includes(updatedPeriod.teacher)) {
                updatedPeriod.teacher = '';
            }
        }

        updatedPeriods[index] = updatedPeriod;
        
        // If changing type or startTime, we cascade the rest
        if (field === 'type' || field === 'startTime') {
            updatedPeriods = cascadePeriods(updatedPeriods, templateDurations, index);
        }
        
        setSchedule({ ...schedule, [activeDay]: updatedPeriods });
    };

    const handleApplyTemplate = (template) => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [activeDay]: template.periods.map(p => ({
                ...p,
                subject: '',
                teacher: '',
                room: ''
            }))
        }));
        setIsTemplateModalOpen(false);
        toast.success(`Applied ${template.name} to ${activeDay}`);
    };

    const handleOpenEditTemplate = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setTemplateName(template.name);
            setTemplatePeriods(template.periods);
        } else {
            setCurrentTemplate(null);
            setTemplateName('');
            setTemplatePeriods([{ startTime: '09:00', endTime: '10:00', type: 'Lecture' }]);
        }
        setIsTemplateEditModalOpen(true);
    };

    const handleSaveTemplate = () => {
        if (!templateName) return toast.error('Template name required');
        
        const data = { name: templateName, periods: templatePeriods };
        
        if (currentTemplate) {
            dispatch(updateTimetableTemplate({ id: currentTemplate._id, data }))
                .unwrap()
                .then(() => {
                    toast.success('Template modified');
                    setIsTemplateEditModalOpen(false);
                });
        } else {
            dispatch(createTimetableTemplate(data))
                .unwrap()
                .then(() => {
                    toast.success('Template created');
                    setIsTemplateEditModalOpen(false);
                });
        }
    };

    const handleDeleteTemplate = (id) => {
        dispatch(deleteTimetableTemplate(id))
            .unwrap()
            .then(() => toast.success('Template decommissioned'));
    };

    const addTemplatePeriod = () => {
        const lastPeriod = templatePeriods.length > 0 ? templatePeriods[templatePeriods.length - 1] : null;
        const startTime = lastPeriod ? lastPeriod.endTime : '09:00';
        const defaultType = lastPeriod ? lastPeriod.type : 'Lecture';
        const duration = templateDurations[defaultType] || 45;

        let endTime = '10:00';
        if (startTime) {
            const [h, m] = startTime.split(':').map(Number);
            const totalMinutes = h * 60 + m + duration;
            const nh = Math.floor(totalMinutes / 60) % 24;
            const nm = totalMinutes % 60;
            endTime = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
        }

        setTemplatePeriods([...templatePeriods, { startTime, endTime, type: defaultType }]);
    };

    const removeTemplatePeriod = (idx) => {
        setTemplatePeriods(templatePeriods.filter((_, i) => i !== idx));
    };

    const updateTemplatePeriod = (idx, field, value) => {
        let newPeriods = [...templatePeriods];
        newPeriods[idx] = { ...newPeriods[idx], [field]: value };
        newPeriods = cascadePeriods(newPeriods, templateDurations, idx);
        setTemplatePeriods(newPeriods);
    };

    const handleSave = async () => {
        if (!selectedClass) return toast.error('Select a class sector to synchronize');

        const scheduleArray = Object.keys(schedule).map(day => ({
            day,
            periods: (schedule[day] || []).filter(p => p.subject && p.teacher)
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="no-print space-y-4">
                {/* ─── Neural Command Header ────────────────── */}
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#030712]/80 p-8 rounded-2xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-50"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] animate-pulse"></div>
                    
                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-glow"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary/80 font-outfit">Sync System v2.0</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit group-hover:scale-[1.01] transition-transform duration-700">
                            Scheduling Center
                        </h1>
                        <p className="text-slate-500 font-bold text-[10px] tracking-[0.2em] uppercase italic flex items-center gap-2">
                            Structural Synchronization across {classes.length} academic sectors
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 relative z-10">
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                            {[
                                { id: 'editor', icon: <Edit2 size={12} />, label: 'Node View' },
                                { id: 'table', icon: <LayoutGrid size={12} />, label: 'Global Registry' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === mode.id ? 'bg-brand-primary text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {mode.icon} {mode.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-10 w-[1px] bg-white/5 hidden xl:block"></div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsTemplateModalOpen(true)}
                                className="flex items-center gap-2 px-6 h-12 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:border-brand-primary/40 hover:text-white hover:bg-slate-900 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 group/btn shadow-inner"
                            >
                                <Settings size={14} className="group-hover/btn:rotate-90 transition-transform duration-700 text-brand-primary/60 group-hover/btn:text-brand-primary" />
                                Infrastructure
                            </button>

                            <div className="relative group">
                                <Layers size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                                <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="bg-slate-950 border border-white/5 h-12 pl-12 pr-10 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-brand-primary/30 transition-all text-white appearance-none cursor-pointer hover:bg-black font-outfit shadow-inner"
                                >
                                    <option value="">Select Sector</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.standardId?.name || `STD-${c.standardId?.level}`} : {c.sectionLabel} {getExistingTimetable(c._id) ? '●' : '○'}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-transform group-hover:translate-y-[-40%] pointer-events-none" />
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={loading || !selectedClass}
                                className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-20 text-white px-8 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                            >
                                {loading ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                                Sync Timeline
                            </button>
                        </div>
                    </div>
                </header>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'table' ? (
                    <motion.div 
                        key="registry"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">Institutional Chronology Archive</h2>
                            <span className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary uppercase tracking-widest italic">{timetables.length} Active Records</span>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
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
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${tt ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-slate-900/60 border-slate-800 text-slate-600'}`}>
                                                            <Layers size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-white uppercase tracking-wider font-outfit italic">
                                                                {cls.standardId?.name || `Standard ${cls.standardId?.level}`} - {cls.sectionLabel}
                                                            </div>
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
                        key="editor"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {selectedClass ? (
                            <div className="flex flex-col gap-6">
                                {/* ─── Phase Selector ────────────────── */}
                                <div className="flex bg-[#030712]/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-md sticky top-0 z-50 overflow-x-auto no-scrollbar shadow-lg">
                                    {days.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setActiveDay(day)}
                                            className={`flex-1 flex flex-col items-center justify-center min-w-[100px] px-4 py-3 rounded-lg transition-all duration-700 relative group/day ${
                                                activeDay === day 
                                                ? 'bg-brand-primary text-white shadow-glow' 
                                                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-outfit ${activeDay === day ? 'text-white' : 'text-slate-400 group-hover/day:text-white'}`}>{day}</span>
                                            <div className="flex items-center gap-1 mt-1 opacity-40">
                                                <div className={`w-1 h-1 rounded-full ${schedule[activeDay]?.length > 0 ? 'bg-current' : 'bg-transparent border border-current'}`}></div>
                                                <span className="text-[7px] font-bold">{(schedule[day] || []).length} Nodes</span>
                                            </div>
                                            {activeDay === day && (
                                                <motion.div layoutId="dayTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-white rounded-full"></motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">Node Sequence:</h3>
                                        <span className="text-sm font-black text-white uppercase italic tracking-widest">{activeDay} Pulse</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setIsTemplateModalOpen(true)}
                                            className="flex items-center gap-2 px-6 h-10 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-brand-primary/30 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 group shadow-inner"
                                        >
                                            <Layers size={14} className="group-hover:rotate-12 transition-transform text-brand-primary/40 group-hover:text-brand-primary" />
                                            Import Pattern
                                        </button>
                                        <button 
                                            onClick={addPeriod}
                                            className="flex items-center gap-2 px-6 h-10 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-all text-[9px] font-black uppercase tracking-widest shadow-glow active:scale-95 group"
                                        >
                                            <Plus size={14} className="group-hover:rotate-12 transition-transform" />
                                            Add Node
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-luxury">
                                    <AnimatePresence mode="popLayout">
                                        {(schedule[activeDay] || []).map((period, idx) => (
                                            <motion.div
                                                key={idx}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-[#030712]/40 border border-white/5 rounded-xl p-4 group hover:border-brand-primary/40 transition-all duration-700 shadow-lg relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-6 relative z-10">
                                                    {/* Step Count */}
                                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-brand-primary transition-colors">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                        <div className="md:col-span-3">
                                                            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                                                                <div className="flex flex-col gap-1">
                                                                    <select 
                                                                        value={period.type || 'Lecture'}
                                                                        disabled
                                                                        className="bg-transparent text-brand-primary text-[8px] font-black outline-none font-outfit uppercase tracking-widest cursor-not-allowed opacity-80"
                                                                    >
                                                                        <option value="Lecture">Lecture</option>
                                                                        <option value="Break">Break</option>
                                                                        <option value="Short Break">Short Break</option>
                                                                        <option value="Long Break">Long Break</option>
                                                                    </select>
                                                                    <div className="flex items-center gap-2">
                                                                        <input 
                                                                            type="time" 
                                                                            value={period.startTime} 
                                                                            onChange={(e) => updatePeriod(idx, 'startTime', e.target.value)} 
                                                                            readOnly={idx > 0}
                                                                            className={`bg-transparent text-white text-[11px] font-black outline-none w-16 ${idx > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                                                        />
                                                                        <ChevronRight size={10} className="text-slate-600" />
                                                                        <input 
                                                                            type="time" 
                                                                            value={period.endTime} 
                                                                            readOnly 
                                                                            className="bg-transparent text-white text-[11px] font-black outline-none w-16 opacity-50 cursor-not-allowed" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {period.type.includes('Break') ? (
                                                            <div className="md:col-span-7 flex items-center justify-center">
                                                                <div className="relative group/break w-full py-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 shadow-inner overflow-hidden flex items-center justify-center">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-brand-primary/60 italic font-outfit relative z-10">
                                                                        {period.type} Node
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="md:col-span-4">
                                                                    <div className="relative group/sel">
                                                                        <BookOpen size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/50 group-focus-within/sel:text-brand-primary" />
                                                                        <select 
                                                                            value={period.subject}
                                                                            onChange={(e) => updatePeriod(idx, 'subject', e.target.value)}
                                                                            className="w-full bg-slate-900/60 border border-white/5 h-10 pl-10 pr-6 rounded-lg text-[10px] font-black uppercase text-white outline-none focus:border-brand-primary/30 transition-all font-outfit appearance-none italic"
                                                                        >
                                                                            <option value="">Subject</option>
                                                                            {(() => {
                                                                                const currentClass = classes.find(c => c._id === selectedClass);
                                                                                return currentClass?.subjectAssignments?.map(a => (
                                                                                    <option key={a.subject?._id} value={a.subject?._id}>{a.subject?.name}</option>
                                                                                )) || [];
                                                                            })()}
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="md:col-span-3">
                                                                    <div className="relative group/sel">
                                                                        <Users size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/50 group-focus-within/sel:text-brand-primary" />
                                                                        <select 
                                                                            value={period.teacher}
                                                                            onChange={(e) => updatePeriod(idx, 'teacher', e.target.value)}
                                                                            className="w-full bg-slate-900/60 border border-white/5 h-10 pl-10 pr-6 rounded-lg text-[10px] font-black uppercase text-white outline-none focus:border-brand-primary/30 transition-all font-outfit appearance-none italic"
                                                                        >
                                                                            <option value="">Educator</option>
                                                                            {(() => {
                                                                                const currentClass = classes.find(c => c._id === selectedClass);
                                                                                const assignment = currentClass?.subjectAssignments?.find(a => (a.subject?._id || a.subject) === period.subject);
                                                                                return assignment?.teachers?.map(t => (
                                                                                    <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                                                                                )) || [];
                                                                            })()}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}

                                                        <div className="md:col-span-2 flex items-center justify-end gap-2 text-right">
                                                            <input 
                                                                placeholder="RM"
                                                                value={period.room}
                                                                onChange={(e) => updatePeriod(idx, 'room', e.target.value)}
                                                                className="w-12 bg-slate-900/60 border border-white/5 h-10 px-2 rounded-lg text-[10px] font-black uppercase text-center text-white outline-none focus:border-brand-primary/30"
                                                            />
                                                            <button onClick={() => removePeriod(idx)} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors bg-slate-900 border border-white/5 rounded-lg active:scale-95"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!schedule[activeDay] || schedule[activeDay].length === 0) && (
                                        <div className="py-24 border-2 border-dashed border-white/5 rounded-2xl bg-[#030712]/40 text-center flex flex-col items-center justify-center space-y-6 backdrop-blur-sm group/empty">
                                            <Clock size={40} className="text-slate-800 opacity-20 group-hover/empty:scale-110 group-hover/empty:text-brand-primary/20 transition-all duration-1000" />
                                            <div>
                                                <h4 className="text-slate-600 font-black uppercase tracking-[0.6em] text-[10px] italic font-outfit">Empty Temporal Node</h4>
                                                <p className="text-slate-700 text-[9px] mt-2 font-bold tracking-[0.3em] uppercase italic bg-slate-900/60 inline-block px-6 py-2 rounded-full border border-white/5">Initialize pedagogical sequences for {activeDay}</p>
                                            </div>
                                            <button 
                                                onClick={addPeriod}
                                                className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-8 py-3 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-brand-primary/20"
                                            >
                                                Apply First Pulse Points
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-48 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#030712]/20 backdrop-blur-md group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] animate-pulse"></div>
                                <LayoutGrid size={80} className="text-slate-800 mb-10 opacity-20 group-hover:scale-110 group-hover:text-brand-primary/10 transition-all duration-1000 relative z-10" />
                                <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.5em] font-outfit italic text-center relative z-10">Sector Link Required</h3>
                                <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase italic mt-4 relative z-10">Select an academic sector to access institutional chronology</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Selection Modal */}
            <Modal
                open={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title="Structural Templates"
                maxWidth="max-w-4xl"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic">Institutional patterns</p>
                        <button 
                            onClick={() => handleOpenEditTemplate()}
                            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest"
                        >
                            <Plus size={12} /> New Infrastructure
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {timetableTemplates.map(template => (
                            <div key={template._id} className="bg-slate-900 border border-white/5 p-5 rounded-xl group hover:border-indigo-500/30 transition-all flex flex-col justify-between h-full shadow-lg">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-black text-white italic tracking-tighter uppercase font-outfit">{template.name}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleOpenEditTemplate(template)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteTemplate(template._id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-6 bg-black/40 p-4 rounded-xl border border-white/5 max-h-32 overflow-y-auto scrollbar-compact">
                                        {template.periods.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5 last:border-none py-1">
                                                <span>{p.startTime} - {p.endTime}</span>
                                                <span className="text-brand-primary/60">{p.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleApplyTemplate(template)}
                                    className="w-full h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest"
                                >
                                    Apply Configuration
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Template Edit Modal */}
            <Modal
                open={isTemplateEditModalOpen}
                onClose={() => setIsTemplateEditModalOpen(false)}
                title={currentTemplate ? "Modify Infrastructure" : "Initialize Infrastructure"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Pattern Identity</label>
                        <input 
                            placeholder="e.g., Morning Shift"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 h-10 px-4 rounded-lg text-white font-black uppercase tracking-widest outline-none focus:border-brand-primary/40 text-[11px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-black/20 rounded-xl border border-white/5">
                        {Object.entries(templateDurations).map(([type, duration]) => (
                            <div key={type} className="space-y-1">
                                <label className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">{type}(m)</label>
                                <input 
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setTemplateDurations({...templateDurations, [type]: parseInt(e.target.value) || 0})}
                                    className="w-full bg-slate-950 border border-white/5 h-8 px-2 rounded-md text-white text-[9px] font-black outline-none focus:border-brand-primary/30"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chronology Nodes</label>
                            <button onClick={addTemplatePeriod} className="text-brand-primary flex items-center gap-1 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                <Plus size={12} /> Add Node
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-compact">
                            {templatePeriods.map((period, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl">
                                    <div className="flex-1 grid grid-cols-4 gap-3">
                                        <select 
                                            value={period.type} 
                                            onChange={(e) => updateTemplatePeriod(idx, 'type', e.target.value)}
                                            className="bg-transparent text-white text-[9px] font-black outline-none border border-white/5 rounded-md p-1.5 uppercase tracking-tighter"
                                        >
                                            <option value="Lecture">Lecture</option>
                                            <option value="Break">Break</option>
                                            <option value="Short Break">SB</option>
                                            <option value="Long Break">LB</option>
                                        </select>
                                        <input 
                                            type="time" 
                                            value={period.startTime} 
                                            onChange={(e) => updateTemplatePeriod(idx, 'startTime', e.target.value)}
                                            readOnly={idx > 0}
                                            className={`bg-transparent text-white text-[10px] font-black outline-none border border-white/5 rounded-md p-1 ${idx > 0 ? 'opacity-50' : ''}`}
                                        />
                                        <input 
                                            type="time" 
                                            value={period.endTime} 
                                            readOnly
                                            className="bg-transparent text-white text-[10px] font-black outline-none border border-white/5 rounded-md p-1 opacity-50"
                                        />
                                        <button onClick={() => removeTemplatePeriod(idx)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveTemplate}
                        className="w-full h-12 rounded-xl bg-brand-primary text-white font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all text-[11px]"
                    >
                        Sync Global Configuration
                    </button>
                </div>
            </Modal>

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full p-8 text-black">
                <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Institutional Chronology</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">
                            Sector: {classes.find(c => c._id === selectedClass)?.standardId?.name || 'Standard X'} - {classes.find(c => c._id === selectedClass)?.sectionLabel || 'A'}
                        </p>
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
                                    <div key={idx} className={`p-4 border rounded-xl space-y-2 ${slot.type.includes('Break') ? 'border-slate-100 bg-slate-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-brand-primary italic">{slot.startTime}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">TO {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tighter italic leading-tight">
                                            {slot.type.includes('Break') 
                                                ? slot.type 
                                                : (subjects.find(s => s._id === slot.subject)?.name || 'Pedagogical Node')}
                                        </h4>
                                        {!slot.type.includes('Break') && (
                                            <>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic truncate">
                                                    {teachers.find(t => t._id === slot.teacher)?.firstName || 'Educator'}
                                                </p>
                                                <div className="text-[8px] font-black text-slate-400 uppercase italic">RM: {slot.room || 'Sector-A'}</div>
                                            </>
                                        )}
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
