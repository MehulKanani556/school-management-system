import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchStudents, fetchAttendance, saveAttendance, fetchStandards, fetchAttendanceReport } from '../../redux/slice/schoolAdmin.slice';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon, Users, Search, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import moment from 'moment';

const statusOptions = ['Present', 'Absent', 'Late', 'Half-Day'];
const statusIcon = { Present: CheckCircle, Absent: XCircle, Late: Clock, 'Half-Day': Clock };
const statusColor = {
    Present: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Absent: 'text-red-400 bg-red-400/10 border-red-400/20',
    Late: 'text-schooladmin-primary bg-schooladmin-primary/10 border-schooladmin-primary/20',
    'Half-Day': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const Attendance = () => {
    const dispatch = useDispatch();
    const { classes, students, attendance, standards, loading } = useSelector((s) => s.schoolAdmin);
    const { activeAcademicYearId } = useSelector((s) => s.academicYear);
    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    // Calendar Management
    const [showMarking, setShowMarking] = useState(false);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [markedDates, setMarkedDates] = useState([]);

    const [records, setRecords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [saved, setSaved] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchStudents());
        dispatch(fetchStandards());
    }, [dispatch]);

    // Refetch marked dates when academic year, class, or month changes
    useEffect(() => {
        console.log('📅 Attendance Page - Academic Year Changed:', activeAcademicYearId, '| Class:', selectedClass);
        if (selectedClass && activeAcademicYearId) {
            const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
            console.log('🔄 Fetching marked dates for:', selectedClass, 'from', startOfMonth, 'to', endOfMonth);
            dispatch(fetchAttendanceReport({
                classSection: selectedClass,
                startDate: startOfMonth,
                endDate: endOfMonth,
                type: 'marked-dates'
            })).then(res => {
                console.log('✅ Marked dates received:', res.payload);
                if (res.payload) setMarkedDates(res.payload);
            });
        }
    }, [selectedClass, currentMonth, activeAcademicYearId, dispatch]);

    // Fetch details for specific marking date
    useEffect(() => {
        if (selectedStandard && selectedClass && viewDate && showMarking && activeAcademicYearId) {
            dispatch(fetchAttendance({ standardId: selectedStandard, classSection: selectedClass, date: viewDate })).then((res) => {
                const existing = res.payload?.[0];
                const currentStudents = students.filter(s => (s.classSection?._id || s.classSection) === selectedClass);

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
                    currentStudents.forEach(s => {
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
    }, [selectedStandard, selectedClass, viewDate, showMarking, activeAcademicYearId, dispatch, students]);

    const handleDateClick = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        setViewDate(formattedDate);
        // Check if already marked to set initial edit mode
        const isAlreadyMarked = markedDates.some(s => moment(s.date).format('YYYY-MM-DD') === formattedDate);
        setIsEditing(!isAlreadyMarked);
        setShowMarking(true);
    };


    const handleSave = async () => {
        const recordsArr = Object.entries(records).map(([studentId, data]) => ({
            studentId,
            ...data
        }));
        await dispatch(saveAttendance({
            standardId: selectedStandard,
            classSection: selectedClass,
            date: viewDate,
            records: recordsArr
        }));
        setIsEditing(false);
        setSaved(true);

        // Refresh marked dates
        const startOfMonth = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
        dispatch(fetchAttendanceReport({
            classSection: selectedClass,
            startDate: startOfMonth,
            endDate: endOfMonth,
            type: 'marked-dates'
        })).then(res => {
            if (res.payload) setMarkedDates(res.payload);
        });

        setTimeout(() => setSaved(false), 3000);
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

    const classStudents = students.filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);
    const filteredStudents = classStudents.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastStudent = currentPage * itemsPerPage;
    const paginatedStudents = filteredStudents.slice(indexOfLastStudent - itemsPerPage, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const markAllPresent = () => {
        const newRecords = { ...records };
        filteredStudents.forEach(s => {
            newRecords[s._id] = { ...newRecords[s._id], status: 'Present' };
        });
        setRecords(newRecords);
    };

    const updateRecord = (id, field, value) => {
        setRecords(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const summary = statusOptions.map(s => ({
        status: s,
        count: Object.values(records).filter(r => r.status === s).length
    }));

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    {showMarking && (
                        <button
                            onClick={() => setShowMarking(false)}
                            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-primary transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">
                            {showMarking ? 'Marking Terminal' : 'Presence Node'}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed italic">
                            {showMarking ? `Marking attendance for ${moment(viewDate).format('MMMM DD, YYYY')}` : 'Institutional attendance telemetry & marking terminal.'}
                        </p>
                    </div>
                </div>
                {showMarking && selectedClass && classStudents.length > 0 && (
                    <div className="flex gap-4">
                        {!isEditing && markedDates.some(s => moment(s.date).format('YYYY-MM-DD') === viewDate) ? (
                            <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all border border-slate-700">
                                Edit Attendance
                            </button>
                        ) : (
                            <>
                                <button onClick={markAllPresent} disabled={!isEditing} className="px-6 py-4 bg-slate-800 disabled:opacity-50 hover:bg-slate-700 text-slate-300 rounded-md font-black text-[11px] uppercase tracking-widest transition-all">Mass Presence</button>
                                <button onClick={handleSave} disabled={loading || !isEditing} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    {loading ? <AlertCircle className="animate-spin" size={18} /> : <Save size={18} />} {saved ? 'Updated!' : 'Commit Changes'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </header>

            {!showMarking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/10 p-6 rounded-3xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 italic font-outfit">Standard (Grade)</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select value={selectedStandard} onChange={e => { setSelectedStandard(e.target.value); setSelectedClass(''); }} className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none transition-all appearance-none cursor-pointer text-sm font-bold italic">
                                    <option value="">Select Grade...</option>
                                    {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 italic font-outfit">Class Sector</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedStandard} className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none transition-all appearance-none cursor-not-allowed disabled:opacity-50 text-sm font-bold italic">
                                    <option value="">Select Sector...</option>
                                    {classes.filter(c => (c.standardId?._id || c.standardId) === selectedStandard).map(c => <option key={c._id} value={c._id}>{c.sectionLabel}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end justify-end pb-1 pr-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Select Sector to Synchronize Dashboard</p>
                    </div>
                </div>
            )}

            {!showMarking ? (
                <AnimatePresence mode="wait">
                    {selectedClass ? (
                        <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-schooladmin-primary/10 border border-schooladmin-primary/20 flex items-center justify-center text-schooladmin-primary shadow-lg shadow-schooladmin-primary/5">
                                        <CalendarIcon size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{currentMonth.format('MMMM YYYY')}</h2>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] font-mono mt-1">Operational Presence Interface</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-inner">
                                    <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronLeft size={24} /></button>
                                    <button onClick={() => setCurrentMonth(moment())} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-white transition-all tracking-widest">Reset</button>
                                    <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"><ChevronRight size={24} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-6 mb-4">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="text-center text-xs font-black uppercase tracking-[0.4em] text-slate-600 pb-4">{d}</div>))}</div>
                            <div className="grid grid-cols-7 gap-10">
                                {calendarGrid.flat().map((date, i) => {
                                    const isCurrentMonth = date.month() === currentMonth.month();
                                    const isToday = date.isSame(moment(), 'day');
                                    const mData = markedDates.find(s => moment(s.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));

                                    const isMarked = mData?.marked;
                                    return (
                                        <motion.div 
                                            key={i} 
                                            whileHover={isCurrentMonth ? { scale: 1.02, y: -4 } : {}}
                                            whileTap={isCurrentMonth ? { scale: 0.98 } : {}}
                                            onClick={() => isCurrentMonth && handleDateClick(date)} 
                                            className={`relative aspect-square rounded-[2rem] p-6 cursor-pointer transition-all duration-500 group border flex flex-col items-center justify-center overflow-hidden 
                                                ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''} 
                                                ${isToday ? 'bg-schooladmin-primary/10 border-schooladmin-primary/30 shadow-2xl shadow-schooladmin-primary/10' : 'bg-slate-950/40 border-white/5 hover:border-schooladmin-primary/40'} 
                                                ${isMarked ? 'bg-emerald-500/[0.03] border-emerald-500/20' : ''}`}
                                        >
                                           
                                            {/* Small Date Indicator at Top */}
                                            <span className={`absolute top-6 left-8 text-sm font-black italic tracking-tighter transition-colors duration-500
                                                ${isToday ? 'text-schooladmin-primary' : 'text-slate-600 group-hover:text-white'} 
                                                ${isMarked ? 'text-emerald-500/40' : ''}`}>
                                                {date.date()}
                                            </span>

                                            <div className="relative z-10 flex flex-col items-center gap-3">
                                                {isMarked ? (
                                                    <>
                                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 mb-1">
                                                            <CheckCircle size={24} />
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase">Finalized</div>
                                                            <div className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-[0.1em] mt-0.5">Registry Stable</div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-700 group-hover:text-slate-400 transition-colors duration-500 mb-1">
                                                            <CalendarIcon size={20} />
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-700 group-hover:text-slate-500 transition-colors duration-500 tracking-[0.2em] uppercase">Awaiting Input</div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Corner Pulse Indicator for Today */}
                                            {isToday && (
                                                <div className="absolute top-6 right-8">
                                                    <div className="w-2 h-2 rounded-full bg-schooladmin-primary shadow-[0_0_15px_#2563eb] animate-pulse" />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="waiting" className="py-40 text-center border border-dashed border-slate-800 rounded-[2rem] bg-slate-900/10 shadow-inner">
                            <CalendarIcon size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                            <p className="text-slate-500 font-bold italic uppercase tracking-[0.4em] text-[12px] font-outfit">Awaiting Academic Sector Synchronization</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            ) : (
                <motion.div key="marking" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {summary.map(({ status, count }) => {
                            const Icon = statusIcon[status];
                            return (
                                <div key={status} className={`flex items-center gap-4 px-6 py-6 rounded-md border backdrop-blur-xl ${statusColor[status]}`}>
                                    <div className="p-3 bg-white/5 rounded-md"><Icon size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{status}</p>
                                        <p className="text-2xl font-black font-outfit leading-none italic">{count}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl relative">
                        <div className="p-8 border-b border-slate-800/40 flex items-center justify-between bg-black/20">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit italic">Student Cluster - {filteredStudents.length} Nodes</h3>
                            <div className="relative group">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-brand-primary transition-colors" />
                                <input type="text" placeholder="Filter IDs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white w-48 focus:outline-none focus:border-brand-primary/40 transition-all font-outfit" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {filteredStudents.length === 0 ? (
                                <div className="py-24 text-center">
                                    <Users size={48} className="text-slate-800 mx-auto mb-4 opacity-20 underline" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">No Student Nodes Detected in this Sector</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/30">
                                                {['Student Identity', 'Admission Node', 'Verification Status', 'Actions'].map(h => (<th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">{h}</th>))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/40">
                                            {paginatedStudents.map((s, i) => (
                                                <React.Fragment key={s._id}>
                                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className={`hover:bg-white/[0.02] transition-colors group ${expandedStudent === s._id ? 'bg-white/[0.03]' : ''}`}>
                                                        <td className="px-10 py-6"><div className="font-bold text-white italic tracking-tight font-outfit uppercase">{s.firstName} {s.lastName}</div></td>
                                                        <td className="px-10 py-6"><span className="text-[11px] font-black text-slate-500 tracking-widest bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-700/50 uppercase font-outfit italic">#{s.admissionNumber}</span></td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex gap-2 flex-wrap">
                                                                {statusOptions.map(status => (
                                                                    <button key={status} disabled={!isEditing} onClick={() => updateRecord(s._id, 'status', status)} className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all font-outfit ${records[s._id]?.status === status ? statusColor[status] : 'text-slate-600 bg-transparent border-slate-800 hover:border-slate-600 disabled:opacity-30'}`}>{status}</button>
                                                                ))}

                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6"><button onClick={() => setExpandedStudent(expandedStudent === s._id ? null : s._id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">{expandedStudent === s._id ? 'Collapse' : 'Details'}<ChevronRight size={14} className={`transition-transform ${expandedStudent === s._id ? 'rotate-90' : ''}`} /></button></td>
                                                    </motion.tr>
                                                    <AnimatePresence>
                                                        {expandedStudent === s._id && (
                                                            <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-black/40 border-l-2 border-brand-primary">
                                                                <td colSpan="4" className="p-8">
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Temporal Tracking</label>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="relative"><Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" /><input type="time" disabled={!isEditing} value={records[s._id]?.arrivalTime || ''} onChange={e => updateRecord(s._id, 'arrivalTime', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary disabled:opacity-50" /></div>
                                                                                <div className="relative"><Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" /><input type="time" disabled={!isEditing} value={records[s._id]?.departureTime || ''} onChange={e => updateRecord(s._id, 'departureTime', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary disabled:opacity-50" /></div>
                                                                            </div>

                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Anomaly Flags</label>
                                                                            <div className="flex gap-4">
                                                                                <button disabled={!isEditing} onClick={() => updateRecord(s._id, 'isLate', !records[s._id]?.isLate)} className={`flex-1 py-3 rounded-md border text-[10px] font-black uppercase transition-all ${records[s._id]?.isLate ? 'bg-schooladmin-primary/10 text-schooladmin-primary border-schooladmin-primary/30' : 'bg-slate-900 text-slate-600 border-slate-800 disabled:opacity-30'}`}>Late Arrival</button>
                                                                                <button disabled={!isEditing} onClick={() => updateRecord(s._id, 'isEarlyLeave', !records[s._id]?.isEarlyLeave)} className={`flex-1 py-3 rounded-md border text-[10px] font-black uppercase transition-all ${records[s._id]?.isEarlyLeave ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-slate-900 text-slate-600 border-slate-800 disabled:opacity-30'}`}>Early Leave</button>
                                                                            </div>

                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Pedagogical Remarks</label>
                                                                            <textarea disabled={!isEditing} value={records[s._id]?.remarks || ''} onChange={e => updateRecord(s._id, 'remarks', e.target.value)} placeholder="Enter Log Data..." className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-xs font-bold text-white outline-none focus:border-brand-primary h-14 disabled:opacity-50" />

                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                    {totalPages > 1 && (
                                        <div className="p-6 border-t border-slate-800/40 flex items-center justify-between bg-black/20">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">Telemetry Page {currentPage} of {totalPages}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded-md border transition-all ${currentPage === 1 ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}><ChevronLeft size={16} /></button>
                                                <div className="flex gap-1">
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-md text-[10px] font-black transition-all font-outfit ${currentPage === i + 1 ? 'bg-brand-primary/20 border border-brand-primary text-brand-primary' : 'border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>{i + 1}</button>
                                                    ))}
                                                </div>
                                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded-md border transition-all ${currentPage === totalPages ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}><ChevronRight size={16} /></button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Attendance;
