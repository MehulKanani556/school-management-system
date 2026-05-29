import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    fetchAssignedClasses, 
    fetchClassStudents, 
    fetchTeacherAttendance, 
    submitAttendance, 
    clearTeacherMessage
} from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Save, Search, ChevronDown, Activity, Calendar as CalendarIcon, Users, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';


const MarkAttendance = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const classIdFromQuery = searchParams.get('classId');

    const { classes, students, attendance, message, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYear } = useSelector((state) => state.academicYear);
    const prevYearRef = useRef(activeAcademicYear);
    
    // Core Selection State
    const [selectedClassId, setSelectedClassId] = useState(classIdFromQuery || '');
    const [showMarking, setShowMarking] = useState(false);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Calendar Management
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [markedDates, setMarkedDates] = useState([]);

    // Marking View State
    const [records, setRecords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);


    const isCurrentUserClassTeacher = useMemo(() => {
        const activeClass = classes.find(c => c._id === selectedClassId);
        return activeClass ? !!activeClass.isClassTeacher : false;
    }, [classes, selectedClassId]);


    useEffect(() => {
        if (classIdFromQuery) {
            setSelectedClassId(classIdFromQuery);
        }
    }, [classIdFromQuery]);

    useEffect(() => {
        // Detect academic year switch — reset all class/attendance state
        if (prevYearRef.current && prevYearRef.current !== activeAcademicYear) {
            setSelectedClassId('');
            setShowMarking(false);
            setMarkedDates([]);
            setRecords({});
            setSearchTerm('');
        }
        prevYearRef.current = activeAcademicYear;
        dispatch(fetchAssignedClasses());
    }, [dispatch, activeAcademicYear]);

    // Initial message cleanup
    useEffect(() => {
        if (message && message.toLowerCase().includes('attendance')) {
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

    // Fetch Marked Dates for the selected class/month
    useEffect(() => {
        if (selectedClassId) {
            const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
            dispatch(fetchTeacherAttendance({ 
                classId: selectedClassId, 
                startDate: startOfMonth, 
                endDate: endOfMonth,
                type: 'marked-dates' 
            })).then(res => {
                if (res.payload && Array.isArray(res.payload)) {
                    setMarkedDates(res.payload);
                } else {
                    setMarkedDates([]);
                }
            });
        }
    }, [selectedClassId, currentMonth, dispatch]);

    // When a class is selected, load students
    useEffect(() => {
        if (selectedClassId) {
            dispatch(fetchClassStudents(selectedClassId));
        }
    }, [selectedClassId, dispatch]);

    // Load attendance records when entering marking mode
    useEffect(() => {
        if (selectedClassId && viewDate && showMarking) {
            dispatch(fetchTeacherAttendance({ classId: selectedClassId, date: viewDate })).then(res => {
                const existing = res.payload?.[0];
                const newRecords = {};
                
                if (existing && existing.records) {
                    existing.records.forEach(r => {
                        const id = r.studentId?._id || r.studentId;
                        if (id) {
                            newRecords[id] = {
                                status: r.status || 'Present',
                                arrivalTime: r.arrivalTime || '',
                                departureTime: r.departureTime || '',
                                isLate: r.isLate || false,
                                isEarlyLeave: r.isEarlyLeave || false,
                                remarks: r.remarks || ''
                            };
                        }
                    });
                } else {
                    students.forEach(s => {
                        newRecords[s._id] = {
                            status: 'Present',
                            arrivalTime: '',
                            departureTime: '',
                            isLate: false,
                            isEarlyLeave: false,
                            remarks: ''
                        };
                    });
                }
                setRecords(newRecords);
            });
        }
    }, [selectedClassId, viewDate, showMarking, students, dispatch]);

    const handleDateClick = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        setViewDate(formattedDate);
        // Check if already marked to set initial edit mode
        const isAlreadyMarked = Array.isArray(markedDates) && markedDates.some(s => s.date === formattedDate);

        setIsEditing(isCurrentUserClassTeacher ? !isAlreadyMarked : false);
        setShowMarking(true);
    };


    const handleSave = async () => {
        const recordsArr = Object.entries(records).map(([studentId, data]) => ({
            studentId,
            ...data
        }));

        const promise = dispatch(submitAttendance({
            classSectionId: selectedClassId,
            date: viewDate,
            records: recordsArr
        })).unwrap();

        toast.promise(promise, {
            loading: 'Writing to registry...',
            success: (res) => res.message || 'Registry synchronized',
            error: (err) => err || 'Synchronization failure'
        });

        try {
            await promise;
            setIsEditing(false);

            // Force refresh marked dates for the current view
            const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
            const response = await dispatch(fetchTeacherAttendance({ 
                classId: selectedClassId, 
                startDate: startOfMonth, 
                endDate: endOfMonth,
                type: 'marked-dates' 
            })).unwrap();
            
            if (response && Array.isArray(response)) {
                setMarkedDates(response);
            } else {
                setMarkedDates([]);
            }
        } catch (error) {
            console.error("Save failure:", error);
        }
    };


    const calendarGrid = useMemo(() => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const endOfMonth = currentMonth.clone().endOf('month');
        const startDay = startOfMonth.day();
        const daysInMonth = currentMonth.daysInMonth();
        
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startDay) {
                    week.push(startOfMonth.clone().subtract(startDay - j, 'days'));
                } else if (day <= daysInMonth) {
                    week.push(startOfMonth.clone().date(day));
                    day++;
                } else {
                    week.push(endOfMonth.clone().add(day - daysInMonth, 'days'));
                    day++;
                }
            }
            grid.push(week);
        }
        return grid;
    }, [currentMonth]);

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { id: 'Present', icon: Check, color: 'text-luxury-emerald border-luxury-emerald/20 bg-luxury-emerald/5', hover: 'hover:bg-luxury-emerald/10' },
        { id: 'Late', icon: Clock, color: 'text-luxury-amber border-luxury-amber/20 bg-luxury-amber/5', hover: 'hover:bg-luxury-amber/10' },
        { id: 'Half-Day', icon: Activity, color: 'text-luxury-blue border-luxury-blue/20 bg-luxury-blue/5', hover: 'hover:bg-luxury-blue/10' },
        { id: 'Absent', icon: X, color: 'text-luxury-rose border-luxury-rose/20 bg-luxury-rose/5', hover: 'hover:bg-luxury-rose/10' },
    ];

    const updateRecord = (id, field, value) => {
        setRecords(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    {showMarking && (
                        <button 
                            onClick={() => setShowMarking(false)}
                            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-primary transition-all shadow-xl"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Teacher Panel</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">
                            Mark Attendance
                        </h1>
                        <p className="text-slate-500 font-medium text-sm tracking-wide italic leading-relaxed">
                            Daily Attendance Registry For Your Assigned Classes.
                        </p>
                    </div>

                </div>

                {!showMarking ? (
                    <div className="relative group min-w-[280px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                            value={selectedClassId}
                            onChange={(e) => { setSelectedClassId(e.target.value); setShowMarking(false); }}
                            className="w-full bg-slate-900/80 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                        >
                            <option value="" className="bg-slate-950 text-slate-600">Select Active Sector</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id} className="bg-slate-950 text-white italic">
                                    Std {cls.standardId?.level || cls.gradeLevel} - {cls.sectionLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        {/* Compact Class/Date info for the header when in marking mode */}
                        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-3 rounded-md px-6 shadow-xl">
                           <div className="flex items-center gap-3 text-slate-400">
                               <Users size={16} />
                               <span className="text-[11px] font-black uppercase tracking-widest italic text-white">
                                   {classes.find(c => c._id === selectedClassId)?.standardId?.level || classes.find(c => c._id === selectedClassId)?.gradeLevel} - {classes.find(c => c._id === selectedClassId)?.sectionLabel}
                               </span>
                           </div>
                           <div className="w-px h-6 bg-slate-800" />
                           <div className="flex items-center gap-3 text-slate-400">
                               <CalendarIcon size={16} />
                               <span className="text-[11px] font-black uppercase tracking-widest italic text-white">
                                   {moment(viewDate).format('DD-MM-YYYY')}
                               </span>
                           </div>
                        </div>
                    </div>
                )}

            </header>

            {!showMarking ? (
                <AnimatePresence mode="wait">
                    {selectedClassId ? (
                        <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-md p-10 shadow-2xl ring-1 ring-white/10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/10">
                                        <CalendarIcon size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{currentMonth.format('MMMM YYYY')}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-[1px] bg-slate-700"></span>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-outfit">Telemetric Operational Registry</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                                    <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-4 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white group"><ChevronLeft size={24} className="group-active:-translate-x-1 transition-transform" /></button>
                                    <button onClick={() => setCurrentMonth(moment())} className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all tracking-[0.3em] font-outfit">Today</button>
                                    <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-4 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white group"><ChevronRight size={24} className="group-active:translate-x-1 transition-transform" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-8 mb-8">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 pb-2">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-8">
                                {calendarGrid.flat().map((date, i) => {
                                    const isCurrentMonth = date.month() === currentMonth.month();
                                    const isToday = date.isSame(moment(), 'day');
                                    const isMarked = Array.isArray(markedDates) && markedDates.some(s => {
                                        const currentGridDate = date.format('YYYY-MM-DD');
                                        return s.date === currentGridDate;
                                    });


                                    
                                    return (
                                    <motion.div 
                                        key={i} 
                                        whileHover={isCurrentMonth ? { scale: 1.02, y: -4 } : {}}
                                        whileTap={isCurrentMonth ? { scale: 0.98 } : {}}
                                        onClick={() => isCurrentMonth && handleDateClick(date)} 
                                        className={`relative aspect-square rounded-2xl p-6 cursor-pointer transition-all duration-500 group border flex flex-col items-center justify-center overflow-hidden ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : ''} ${isToday ? 'bg-brand-primary/5 border-brand-primary/30 ring-2 ring-brand-primary/20 shadow-2xl' : 'bg-slate-950/40 border-white/5 hover:border-white/10'} ${isMarked ? 'bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : ''}`}
                                    >
                                        <span className={`absolute top-6 left-6 text-sm font-black font-outfit tracking-tighter ${isMarked ? 'text-emerald-500/60' : 'text-slate-600 group-hover:text-slate-400'}`}>{date.date()}</span>
                                        
                                        <div className="flex flex-col items-center gap-6">
                                            {isMarked ? (
                                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                    <CheckCircle size={24}  />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-slate-500 group-hover:border-slate-700 transition-all">
                                                    <Users size={24} />
                                                </div>
                                            )}

                                            <div className="text-center space-y-1">
                                                {isMarked ? (
                                                    <>
                                                        <p className="text-[12px] font-black uppercase tracking-widest text-emerald-400 font-outfit">Done</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/60">Registry Stable</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-slate-500 transition-colors font-outfit italic">Pending</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                    );

                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 bg-slate-950/40 border-2 border-dashed border-slate-800/40 rounded-md">
                            <Activity size={60} className="text-slate-800 mb-8 opacity-20" />
                            <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[12px] italic">Awaiting Sector Node Synchronization</p>
                        </div>
                    )}
                </AnimatePresence>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 bg-slate-900/20 p-6 rounded-md border border-slate-800/40">
                        <div className="relative group flex-1 max-w-md">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search student by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-primary/60 outline-none h-14 pl-16 pr-6 rounded-md text-[12px] font-bold text-slate-100 shadow-2xl transition-all font-outfit italic tracking-wide"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            {!isCurrentUserClassTeacher ? (
                                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-md px-6 shadow-xl">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">Read-Only Mode</span>
                                </div>
                            ) : !isEditing && Array.isArray(markedDates) && markedDates.some(s => moment(s.date).format('YYYY-MM-DD') === viewDate) ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-10 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[11px] transition-all border border-slate-700 font-outfit italic"
                                >
                                    <Clock size={20} className="text-brand-primary" /> Edit Attendance
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => {
                                            const newRecords = { ...records };
                                            filteredStudents.forEach(s => { newRecords[s._id] = { ...newRecords[s._id], status: 'Present' }; });
                                            setRecords(newRecords);
                                        }}
                                        disabled={!isEditing}
                                        className="px-6 h-14 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-md font-black text-[11px] uppercase tracking-widest transition-all italic"
                                    >
                                        Mark All Present
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={loading || !isEditing}
                                        className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-teacher-primary text-white px-10 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[11px] transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 font-outfit italic shadow-brand-primary/20"
                                    >
                                        {loading ? <Activity size={20} className="animate-spin" /> : <Save size={20} />} {Array.isArray(markedDates) && markedDates.some(s => moment(s.date).format('YYYY-MM-DD') === viewDate) ? 'Update Registry' : 'Commit Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>


                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-md shadow-2xl overflow-hidden backdrop-blur-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/60 border-b border-slate-800/50">
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-outfit text-center">Student Name</th>
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center font-outfit">Attendance Status</th>
                                        <th className="px-8 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center font-outfit">More Details</th>
                                    </tr>

                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredStudents.map((student, idx) => (
                                            <React.Fragment key={student._id}>
                                                <motion.tr initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`group hover:bg-white/[0.02] transition-colors ${expandedStudent === student._id ? 'bg-white/[0.03]' : ''}`}>
                                                    <td className="px-12 py-7">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 text-sm overflow-hidden group-hover:border-brand-primary/40 transition-all duration-500">
                                                                {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 shadow-2xl" /> : <Activity size={20} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-2">{student.firstName} {student.lastName}</p>
                                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Node Ref: {student.admissionNumber || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-7">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {statusOptions.map(status => (
                                                                <button
                                                                    key={status.id}
                                                                    type="button"
                                                                    disabled={!isEditing}
                                                                    onClick={() => updateRecord(student._id, 'status', status.id)}
                                                                    className={`flex items-center gap-2 px-5 h-12 rounded-md border transition-all duration-500 font-outfit italic ${records[student._id]?.status === status.id ? `${status.color} shadow-2xl scale-[1.05] ring-2 ring-slate-900/50` : `border-slate-800/30 text-slate-600 bg-transparent ${status.hover} hover:border-slate-700 disabled:opacity-30`}`}
                                                                >
                                                                    <status.icon size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">{status.id}</span>
                                                                </button>
                                                            ))}

                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7 text-center">
                                                        <button onClick={() => setExpandedStudent(expandedStudent === student._id ? null : student._id)} className={`p-3 rounded-md transition-all ${expandedStudent === student._id ? 'bg-brand-primary text-white shadow-2xl' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                                            <ChevronDown size={18} className={`transition-transform duration-500 ${expandedStudent === student._id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                                <AnimatePresence>
                                                    {expandedStudent === student._id && (
                                                        <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-900/20">
                                                            <td colSpan="3" className="px-12 py-8 border-b border-slate-800/30">
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Temporal Markers</label>
                                                                        <div className="relative group">
                                                                            <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary" />
                                                                            <input
                                                                                type="time"
                                                                                disabled={!isEditing}
                                                                                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-md h-12 pl-12 shadow-inner text-xs font-bold text-white font-outfit focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                                                                value={records[student._id]?.arrivalTime}
                                                                                onChange={(e) => updateRecord(student._id, 'arrivalTime', e.target.value)}
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-3">
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Pedagogical Remarks</label>
                                                                        <textarea
                                                                            disabled={!isEditing}
                                                                            className="w-full bg-slate-950/50 border border-slate-800/60 rounded-md p-4 text-xs font-bold text-white font-outfit min-h-[100px] resize-none italic focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                                                            placeholder="Synchronize additional log data..."
                                                                            value={records[student._id]?.remarks}
                                                                            onChange={(e) => updateRecord(student._id, 'remarks', e.target.value)}
                                                                        ></textarea>

                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MarkAttendance;

