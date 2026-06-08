import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchClasses, fetchSubjects, fetchTeachers, fetchTimetable, saveTimetable, deleteTimetable, fetchAllTimetables, clearError, fetchTimetableTemplates, createTimetableTemplate, updateTimetableTemplate, deleteTimetableTemplate } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Plus, Trash2, Save, Calendar, Users, BookOpen, Layers, Edit2, Check, X, AlertCircle, LayoutGrid, List, Table as TableIcon, ChevronRight, ChevronDown, Printer, Settings, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState('');
    const [activeGrade, setActiveGrade] = useState('');
    const [activeDay, setActiveDay] = useState('Monday');
    const [viewMode, setViewMode] = useState('table'); // 'editor' | 'table'
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
    
    // Copy Management States
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [sourceDay, setSourceDay] = useState('');
    const { classes, subjects, teachers, timetable, timetables, timetableTemplates, loading, error } = useSelector((state) => state.schoolAdmin);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear);

    useEffect(() => {
        if (!activeAcademicYearId) return;
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
        dispatch(fetchTeachers());
        dispatch(fetchAllTimetables());
        dispatch(fetchTimetableTemplates());
        if (selectedClass) dispatch(fetchTimetable(selectedClass));
    }, [dispatch, activeAcademicYearId]);

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
        const timetableClassId = timetable?.classSection?._id || timetable?.classSection;
        if (timetable && timetableClassId === selectedClass) {
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
        const type = 'Lecture';
        const duration = templateDurations[type] || 45;
        
        let endTime = '10:00';
        if (startTime) {
            const [h, m] = startTime.split(':').map(Number);
            const totalMinutes = h * 60 + m + duration;
            const nh = Math.floor(totalMinutes / 60) % 24;
            const nm = totalMinutes % 60;
            endTime = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
        }

        const newPeriod = { startTime, endTime, subject: '', teacher: '', room: '', type };
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
            const startTime = '09:00';
            const duration = templateDurations['Lecture'] || 45;
            const [h, m] = startTime.split(':').map(Number);
            const totalMinutes = h * 60 + m + duration;
            const nh = Math.floor(totalMinutes / 60) % 24;
            const nm = totalMinutes % 60;
            const endTime = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
            
            setTemplatePeriods([{ startTime, endTime, type: 'Lecture' }]);
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
                    setIsTemplateEditModalOpen(false);
                });
        } else {
            dispatch(createTimetableTemplate(data))
                .unwrap()
                .then(() => {
                    setIsTemplateEditModalOpen(false);
                });
        }
    };

    const handleDeleteTemplate = (id) => {
        dispatch(deleteTimetableTemplate(id))
            .unwrap();
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

    const handleCopySchedule = () => {
        if (!sourceDay) return toast.error('Select a day to copy from');
        
        const sourceSchedule = schedule[sourceDay] || [];
        
        setSchedule({
            ...schedule,
            [activeDay]: sourceSchedule.map(p => ({ ...p }))
        });
        
        setIsCopyModalOpen(false);
        setSourceDay('');
        toast.success(`Schedule imported from ${sourceDay} to ${activeDay}`);
    };

    const handleSave = async () => {
        if (!selectedClass) return toast.error('Select a class to save');

        const scheduleArray = Object.keys(schedule).map(day => ({
            day,
            periods: (schedule[day] || [])
                .filter(p => 
                    (p.type === 'Lecture' && p.subject && p.teacher) || 
                    (p.type !== 'Lecture')
                )
                .map(p => {
                    const cleanP = { ...p };
                    if (!p.subject || p.subject === "") delete cleanP.subject;
                    if (!p.teacher || p.teacher === "") delete cleanP.teacher;
                    return cleanP;
                })
        }));

        dispatch(saveTimetable({ classSection: selectedClass, schedule: scheduleArray }))
            .unwrap()
            .then(() => {
                dispatch(fetchAllTimetables());
            })
            .catch((err) => toast.error(err.message || 'Saving failed'));
    };

    const handleDeleteTimetable = async (id) => {
        if (await window.confirm('Delete this entire class timetable? This cannot be undone.')) {
            dispatch(deleteTimetable(id))
                .unwrap()
                .catch((err) => toast.error(err.message || 'Delete failed'));
        }
    };

    const getExistingTimetable = (classId) => {
        return timetables.find(t => t.classSection?._id === classId || t.classSection === classId);
    };

    const getTeacherConflict = (teacherId, day, startTime, endTime) => {
        if (!teacherId || !day || !startTime || !endTime || !timetables) return null;
        
        for (const tt of timetables) {
            if (tt.classSection?._id === selectedClass || tt.classSection === selectedClass) continue;

            const daySchedule = tt.schedule.find(s => s.day === day);
            if (!daySchedule) continue;

            for (const p of daySchedule.periods) {
                if (p.type.includes('Break') || !p.teacher) continue;
                const pTeacherId = p.teacher?._id || p.teacher;
                if (pTeacherId === teacherId) {
                    if (startTime < p.endTime && p.startTime < endTime) {
                        return {
                            className: tt.classSection?.standardId?.name || 'Class',
                            section: tt.classSection?.sectionLabel || '',
                            room: p.room || 'N/A'
                        };
                    }
                }
            }
        }
        return null;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="no-print space-y-4">
                {/* ─── Neural Command Header ────────────────── */}
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#030712]/80 p-8 rounded-md border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-50"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-md blur-[100px] animate-pulse"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        {viewMode === 'editor' && (
                            <button 
                                type="button"
                                onClick={() => setViewMode('table')}
                                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md text-slate-400 hover:text-white transition-all shadow-lg mt-1 animate-fadeIn"
                                title="Go Back to All Timetables"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-md bg-brand-primary shadow-glow"></div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-primary/80 font-outfit">Timetable System v2.0</span>
                            </div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit group-hover:scale-[1.01] transition-transform duration-700">
                                Timetable Management
                            </h1>
                            <p className="text-slate-500 font-bold text-[10px] tracking-[0.2em] uppercase italic flex items-center gap-2">
                                Class schedules for {classes.length} school standards
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 relative z-10">
                        <div className="flex bg-black/40 p-1 rounded-md border border-white/5 backdrop-blur-md">
                            {[
                                { id: 'editor', icon: <Edit2 size={12} />, label: 'Editor View' },
                                { id: 'table', icon: <LayoutGrid size={12} />, label: 'All Timetables' }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === mode.id ? 'bg-brand-primary text-white shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {mode.icon} {mode.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-10 w-[1px] bg-white/5 hidden xl:block"></div>

                        <div className="flex items-center gap-3">
                            {/* <button 
                                onClick={() => setIsTemplateModalOpen(true)}
                                className="flex items-center gap-2 px-6 h-12 rounded-md bg-slate-900/60 border border-white/5 text-slate-400 hover:border-brand-primary/40 hover:text-white hover:bg-slate-900 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 group/btn shadow-inner"
                            >
                                <Settings size={14} className="group-hover/btn:rotate-90 transition-transform duration-700 text-brand-primary/60 group-hover/btn:text-brand-primary" />
                                Templates
                            </button> */}

                            <div className="relative group">
                                <Layers size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                                <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="bg-slate-950 border border-white/5 h-12 pl-12 pr-10 rounded-md text-[9px] font-black uppercase tracking-widest outline-none focus:border-brand-primary/30 transition-all text-white appearance-none cursor-pointer hover:bg-black font-outfit shadow-inner"
                                >
                                    <option value="">Select Class</option>
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
                                className="flex items-center gap-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-20 text-white px-8 h-12 rounded-md text-[9px] font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                            >
                                {loading ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-md animate-spin" /> : <Save size={14} />}
                                Save Timetable
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
                            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 font-outfit italic">All Class Timetables</h2>
                            <span className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-md text-[9px] font-black text-brand-primary uppercase tracking-widest italic">{timetables.length} Active Records</span>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-md overflow-hidden backdrop-blur-xl shadow-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800/60 bg-slate-900/40">
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Class & Section</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Periods</th>
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
                                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center border transition-all ${tt ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-slate-900/60 border-slate-800 text-slate-600'}`}>
                                                            <Layers size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-white uppercase tracking-wider font-outfit italic">
                                                                {cls.standardId?.name || `Standard ${cls.standardId?.level}`} - {cls.sectionLabel}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">School Unit</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    {tt ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-md bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                                                            Synchronized
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-md bg-slate-600"></div>
                                                            Awaiting Node Initialization
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="text-[12px] font-black text-slate-300 font-outfit italic">{periodCount} <span className="text-slate-600 text-[10px] ml-1 uppercase">Periods</span></div>
                                                </td>
                                                <td className="px-10 py-8 text-right flex items-center justify-end gap-3">
                                                    {tt && (
                                                        <button 
                                                            onClick={() => handleDeleteTimetable(tt._id)}
                                                            className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => { setSelectedClass(cls._id); setViewMode('editor'); }}
                                                        className="h-12 px-8 rounded-md border border-slate-800 bg-slate-900/60 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 transition-all flex items-center justify-center gap-3 group/btn"
                                                    >
                                                        {tt ? 'Edit' : 'Create'}
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
                                <div className="flex bg-[#030712]/60 p-1.5 rounded-md border border-white/5 backdrop-blur-md sticky top-0 z-50 overflow-x-auto no-scrollbar shadow-lg">
                                    {days.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setActiveDay(day)}
                                            className={`flex-1 flex flex-col items-center justify-center min-w-[100px] px-4 py-3 rounded-md transition-all duration-700 relative group/day ${
                                                activeDay === day 
                                                ? 'bg-brand-primary text-white shadow-glow' 
                                                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-outfit ${activeDay === day ? 'text-white' : 'text-slate-400 group-hover/day:text-white'}`}>{day}</span>
                                            <div className="flex items-center gap-1 mt-1 opacity-40">
                                                <div className={`w-1 h-1 rounded-md ${schedule[activeDay]?.length > 0 ? 'bg-current' : 'bg-transparent border border-current'}`}></div>
                                                <span className="text-[7px] font-bold">{(schedule[day] || []).length} Periods</span>
                                            </div>
                                            {activeDay === day && (
                                                <motion.div layoutId="dayTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-white rounded-md"></motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 font-outfit italic">Schedule for:</h3>
                                        <span className="text-sm font-black text-white uppercase italic tracking-widest">{activeDay}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => { setIsCopyModalOpen(true); setSourceDay(''); }}
                                            className="flex items-center gap-2 px-6 h-10 rounded-md bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-brand-primary/30 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 group shadow-inner"
                                        >
                                            <Calendar size={14} className="text-brand-primary/40 group-hover:text-brand-primary" />
                                            Import from Day
                                        </button>
                                        <button 
                                            onClick={() => setIsTemplateModalOpen(true)}
                                            className="flex items-center gap-2 px-6 h-10 rounded-md bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-brand-primary/30 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 group shadow-inner"
                                        >
                                            <Layers size={14} className="group-hover:rotate-12 transition-transform text-brand-primary/40 group-hover:text-brand-primary" />
                                            Use Template
                                        </button>
                                        <button 
                                            onClick={addPeriod}
                                            className="flex items-center gap-2 px-6 h-10 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 transition-all text-[9px] font-black uppercase tracking-widest shadow-glow active:scale-95 group"
                                        >
                                            <Plus size={14} className="group-hover:rotate-12 transition-transform" />
                                            Add Period
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
                                                className="bg-[#030712]/40 border border-white/5 rounded-md p-4 group hover:border-brand-primary/40 transition-all duration-700 shadow-lg relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-6 relative z-10">
                                                    {/* Step Count */}
                                                    <div className="shrink-0 w-8 h-8 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-brand-primary transition-colors">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                        <div className="md:col-span-3">
                                                            <div className="bg-slate-900/60 p-2 rounded-md border border-white/5">
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
                                                                <div className="relative group/break w-full py-3 bg-brand-primary/5 rounded-md border border-brand-primary/10 shadow-inner overflow-hidden flex items-center justify-center">
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-brand-primary/60 italic font-outfit relative z-10">
                                                                        {period.type}
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
                                                                            className="w-full bg-slate-900/60 border border-white/5 h-10 pl-10 pr-6 rounded-md text-[10px] font-black uppercase text-white outline-none focus:border-brand-primary/30 transition-all font-outfit appearance-none italic"
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
                                                                            className="w-full bg-slate-900/60 border border-white/5 h-10 pl-10 pr-6 rounded-md text-[10px] font-black uppercase text-white outline-none focus:border-brand-primary/30 transition-all font-outfit appearance-none italic"
                                                                        >
                                                                            <option value="">Teacher</option>
                                                                            {(() => {
                                                                                const currentClass = classes.find(c => c._id === selectedClass);
                                                                                const assignment = currentClass?.subjectAssignments?.find(a => (a.subject?._id || a.subject) === period.subject);
                                                                                return assignment?.teachers?.map(t => {
                                                                                    const conflict = getTeacherConflict(t._id, activeDay, period.startTime, period.endTime);
                                                                                    return (
                                                                                        <option 
                                                                                            key={t._id} 
                                                                                            value={t._id}
                                                                                            disabled={!!conflict}
                                                                                            className={conflict ? 'bg-slate-900 text-slate-600' : 'text-white'}
                                                                                        >
                                                                                            {t.firstName} {t.lastName} {conflict ? `[BUSY: ${conflict.className}-${conflict.section} | RM:${conflict.room}]` : ''}
                                                                                        </option>
                                                                                    );
                                                                                }) || [];
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
                                                                className="w-12 bg-slate-900/60 border border-white/5 h-10 px-2 rounded-md text-[10px] font-black uppercase text-center text-white outline-none focus:border-brand-primary/30"
                                                            />
                                                            <button onClick={() => removePeriod(idx)} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors bg-slate-900 border border-white/5 rounded-md active:scale-95"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!schedule[activeDay] || schedule[activeDay].length === 0) && (
                                        <div className="py-24 border-2 border-dashed border-white/5 rounded-md bg-[#030712]/40 text-center flex flex-col items-center justify-center space-y-6 backdrop-blur-sm group/empty">
                                            <Clock size={40} className="text-slate-800 opacity-20 group-hover/empty:scale-110 group-hover/empty:text-brand-primary/20 transition-all duration-1000" />
                                            <div>
                                                <h4 className="text-slate-600 font-black uppercase tracking-[0.6em] text-[10px] italic font-outfit">Empty Schedule</h4>
                                                <p className="text-slate-700 text-[9px] mt-2 font-bold tracking-[0.3em] uppercase italic bg-slate-900/60 inline-block px-6 py-2 rounded-md border border-white/5">Create periods for {activeDay}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                {days.some(d => d !== activeDay && schedule[d]?.length > 0) ? (
                                                    <button 
                                                        onClick={() => { setIsCopyModalOpen(true); setSourceDay(''); }}
                                                        className="bg-brand-primary text-white px-10 py-3 rounded-md text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-glow border border-brand-primary/20 flex items-center gap-3"
                                                    >
                                                        <Calendar size={14} /> Import from Day
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={addPeriod}
                                                        className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-8 py-3 rounded-md text-[9px] font-black uppercase tracking-[0.3em] transition-all border border-brand-primary/20 flex items-center gap-3"
                                                    >
                                                        <Plus size={14} /> Add Your First Period
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 py-6">
                                {!activeGrade ? (
                                    <div className="space-y-5">
                                        {/* <div className="flex flex-col items-center text-center space-y-4 bg-slate-900/40 py-8 rounded-md border border-white/5 backdrop-blur-md">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-md">
                                                <div className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse"></div>
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-primary italic">Initialization Phase 01</span>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] font-outfit italic leading-none">Select Grade</h3>
                                            <p className="text-slate-500 text-[9px] font-black tracking-[0.2em] uppercase italic max-w-md mx-auto">Choose a standard to begin crafting academic schedules</p>
                                        </div> */}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                                            {Array.from(new Set(classes.map(c => c.standardId?._id))).map(stdId => {
                                                const std = classes.find(c => c.standardId?._id === stdId)?.standardId;
                                                const sectionCount = classes.filter(c => c.standardId?._id === stdId).length;
                                                return (
                                                    <motion.button
                                                        key={stdId}
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        onClick={() => setActiveGrade(stdId)}
                                                        className="group relative h-44 bg-[#080c14] border border-white/5 rounded-md p-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all duration-300 text-left overflow-hidden shadow-2xl"
                                                    >
                                                        {/* Icon Box */}
                                                        <div className="w-10 h-10 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-inner relative z-10 transition-transform group-hover:scale-110">
                                                            <GraduationCap size={20} />
                                                        </div>

                                                        {/* Badge */}
                                                        <div className="absolute top-6 right-6 px-3 py-1 bg-slate-900/60 border border-white/10 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest z-10">
                                                            {sectionCount} Sections
                                                        </div>

                                                        {/* Title Section */}
                                                        <div className="relative z-10">
                                                            <h4 className="text-[17px] font-black text-white font-outfit leading-tight mb-1">{std?.name || `Grade ${std?.level}`}</h4>
                                                            <p className="text-slate-600 text-[10px] font-bold tracking-tight">Click To View Classrooms</p>
                                                        </div>

                                                        {/* Watermark */}
                                                        <GraduationCap 
                                                            size={120} 
                                                            className="absolute -bottom-6 -right-6 text-white/[0.03] -rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:text-white/[0.05]" 
                                                        />
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mx-auto px-6">
                                        <div className="flex items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-md border border-white/5 backdrop-blur-xl">
                                            <div className="flex items-center gap-6">
                                                <button 
                                                    onClick={() => setActiveGrade('')}
                                                    className="w-10 h-10 rounded-md bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all group"
                                                >
                                                    <ChevronDown size={14} className="rotate-90 group-hover:-translate-x-1 transition-transform" />
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] font-outfit italic leading-none">Select Classroom</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-brand-primary text-[9px] font-black tracking-widest uppercase italic">Standard: {classes.find(c => c.standardId?._id === activeGrade)?.standardId?.name || 'Class'}</span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                        <span className="text-slate-500 text-[9px] font-black tracking-widest uppercase italic">Phase 02</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-5 py-3 bg-black/40 border border-white/5 rounded-md text-center min-w-[100px]">
                                                <div className="text-lg font-black text-white font-outfit italic leading-none">{classes.filter(c => c.standardId?._id === activeGrade).length}</div>
                                                <div className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Sections</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-5">
                                            {classes.filter(c => c.standardId?._id === activeGrade).map(cls => {
                                                const tt = getExistingTimetable(cls._id);
                                                return (
                                                    <motion.button
                                                        key={cls._id}
                                                        whileHover={{ scale: 1.03 }}
                                                        onClick={() => setSelectedClass(cls._id)}
                                                        className="group p-12 bg-[#030712]/60 border border-white/5 rounded-md flex flex-col gap-8 hover:border-brand-primary/40 hover:bg-slate-900 transition-all duration-700 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-brand-primary/10 transition-all"></div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="w-16 h-16 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center text-brand-primary/60 group-hover:text-brand-primary shadow-inner group-hover:scale-110 transition-transform duration-700">
                                                                <Layers size={32} />
                                                            </div>
                                                            <div className={`px-5 py-2 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all duration-700 ${tt ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'bg-slate-800/40 text-slate-500 border-white/5'}`}>
                                                                {tt ? 'System Sync Active' : 'Uninitialized'}
                                                            </div>
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="text-3xl font-black text-white uppercase italic tracking-tighter font-outfit group-hover:tracking-widest transition-all duration-1000">Section {cls.sectionLabel}</div>
                                                            <div className="flex items-center gap-3 mt-4">
                                                                <div className="flex -space-x-2">
                                                                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-md bg-slate-800 border border-slate-950"></div>)}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">Full Academic Unit</div>
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                                                            <div className="flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-[0.3em]">
                                                                Enter Session <ChevronRight size={14} />
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Selection Modal */}
            <Modal
                open={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                title="Timetable Templates"
                maxWidth="max-w-4xl"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest italic">Manage your predefined patterns</p>
                        <button 
                            onClick={() => handleOpenEditTemplate()}
                            className="flex items-center gap-2 px-4 h-10 rounded-md bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest"
                        >
                            <Plus size={12} /> Add New Template
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {timetableTemplates.map(template => (
                            <div key={template._id} className="bg-slate-900 border border-white/5 p-5 rounded-md group hover:border-schooladmin-primary/30 transition-all flex flex-col justify-between h-full shadow-lg">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-black text-white italic tracking-tighter uppercase font-outfit">{template.name}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleOpenEditTemplate(template)} className="p-2 text-slate-500 hover:text-schooladmin-primary transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteTemplate(template._id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-6 bg-black/40 p-4 rounded-md border border-white/5 max-h-32 overflow-y-auto scrollbar-compact">
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
                                    className="w-full h-10 rounded-md bg-schooladmin-primary/10 border border-schooladmin-primary/20 text-schooladmin-primary hover:bg-schooladmin-primary hover:text-white transition-all text-[8px] font-black uppercase tracking-widest"
                                >
                                    Apply Template
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
                title={currentTemplate ? "Edit Template" : "Create Template"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Template Name</label>
                        <input 
                            placeholder="e.g., Morning Shift"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 h-10 px-4 rounded-md text-white font-black uppercase tracking-widest outline-none focus:border-brand-primary/40 text-[11px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-black/20 rounded-md border border-white/5">
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
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Periods in Template</label>
                            <button onClick={addTemplatePeriod} className="text-brand-primary flex items-center gap-1 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                <Plus size={12} /> Add Period
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 scrollbar-compact">
                            {templatePeriods.map((period, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-md">
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
                        className="w-full h-12 rounded-md bg-brand-primary text-white font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all text-[11px]"
                    >
                        Save Template
                    </button>
                </div>
            </Modal>

            {/* Copy Day Modal */}
            <Modal
                open={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                title={`Copy to ${activeDay} from...`}
                maxWidth="max-w-md"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {days.filter(d => d !== activeDay && schedule[d]?.length > 0).map(day => (
                            <button 
                                key={day}
                                onClick={() => setSourceDay(day)}
                                className={`h-12 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    sourceDay === day 
                                    ? 'bg-brand-primary text-white border-brand-primary shadow-glow' 
                                    : 'bg-slate-900 text-slate-400 border-white/5 hover:border-brand-primary/40'
                                }`}
                            >
                                {day}
                                <div className="text-[7px] opacity-40 lowercase tracking-normal">{(schedule[day] || []).length} periods</div>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleCopySchedule}
                        className="w-full h-12 rounded-md bg-brand-primary text-white font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all font-outfit"
                    >
                        Confirm Import
                    </button>
                </div>
            </Modal>

            {/* ─── Institutional Chronology Archival View (Print) ────────────────── */}
            <div className="print-only w-full p-8 text-black">
                <div className="mb-12 border-b-2 border-slate-900 pb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Class Timetable</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">
                            Class: {classes.find(c => c._id === selectedClass)?.standardId?.name || 'Standard X'} - {classes.find(c => c._id === selectedClass)?.sectionLabel || 'A'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Official Schedule</p>
                        <p className="text-lg font-black italic">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-6 border-2 border-slate-900 divide-x-2 divide-slate-900 rounded-md overflow-hidden">
                    {days.map(day => (
                        <div key={day} className="flex flex-col">
                            <div className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest text-center italic border-b-2 border-slate-900">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 min-h-[600px]">
                                {(schedule[day] || []).map((slot, idx) => (
                                    <div key={idx} className={`p-4 border rounded-md space-y-2 ${slot.type.includes('Break') ? 'border-slate-100 bg-slate-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-brand-primary italic">{slot.startTime}</span>
                                            <span className="text-[9px] font-bold text-slate-400 italic">TO {slot.endTime}</span>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tighter italic leading-tight">
                                            {slot.type.includes('Break') 
                                                ? slot.type 
                                                : (subjects.find(s => s._id === slot.subject)?.name || 'Period')}
                                        </h4>
                                        {!slot.type.includes('Break') && (
                                            <>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic truncate">
                                                    {teachers.find(t => t._id === slot.teacher)?.firstName || 'Teacher'}
                                                </p>
                                                <div className="text-[8px] font-black text-slate-400 uppercase italic">RM: {slot.room || 'N/A'}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">© 2026 School Management System</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Unauthorized distribution prohibited</div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminTimetable;
