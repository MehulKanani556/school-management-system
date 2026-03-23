import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchStudents, fetchAttendance, saveAttendance, fetchStandards } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users, Search, ChevronRight, ChevronLeft } from 'lucide-react';

const statusOptions = ['Present', 'Absent', 'Late', 'Half-Day'];
const statusIcon = { Present: CheckCircle, Absent: XCircle, Late: Clock, 'Half-Day': Clock };
const statusColor = {
    Present: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Absent: 'text-red-400 bg-red-400/10 border-red-400/20',
    Late: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    'Half-Day': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const Attendance = () => {
    const dispatch = useDispatch();
    const { classes, students, attendance, standards, loading } = useSelector((s) => s.schoolAdmin);
    const [selectedStandard, setSelectedStandard] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [saved, setSaved] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchStudents());
        dispatch(fetchStandards());
        dispatch(fetchAttendance({})); 
    }, [dispatch]);

    useEffect(() => {
        if (selectedStandard && selectedClass && date) {
            dispatch(fetchAttendance({ standardId: selectedStandard, classSection: selectedClass, date })).then((res) => {
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
    }, [selectedStandard, selectedClass, date, dispatch, students]);

    const classStudents = students.filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);
    
    const filteredStudents = classStudents.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastStudent = currentPage * itemsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
    const paginatedStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedClass]);

    const handleSave = async () => {
        const recordsArr = Object.entries(records).map(([studentId, data]) => ({
            studentId,
            ...data
        }));
        await dispatch(saveAttendance({ standardId: selectedStandard, classSection: selectedClass, date, records: recordsArr }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const markAllPresent = () => {
        const newRecords = { ...records };
        filteredStudents.forEach(s => { 
            newRecords[s._id] = { ...newRecords[s._id], status: 'Present' }; 
        });
        setRecords(newRecords);
    };

    const updateRecord = (id, field, value) => {
        setRecords(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const summary = statusOptions.map(s => ({ 
        status: s, 
        count: Object.values(records).filter(r => r.status === s).length 
    }));

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit text-shadow-glow">Presence Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-xl italic">Institutional attendance telemetry & marking terminal.</p>
                </div>
                {selectedClass && classStudents.length > 0 && (
                    <div className="flex gap-4">
                        <button onClick={markAllPresent} 
                            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-black text-[11px] uppercase tracking-widest transition-all">
                            Mass Presence
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            {loading ? <AlertCircle className="animate-spin" size={18} /> : <Save size={18} />} {saved ? 'System Updated!' : 'Commit Attendance'}
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 italic font-outfit">Standard (Grade)</label>
                        <div className="relative">
                            <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <select value={selectedStandard} onChange={e => { setSelectedStandard(e.target.value); setSelectedClass(''); }}
                                className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none transition-all appearance-none cursor-pointer text-sm font-bold font-outfit italic">
                                <option value="">Select Grade...</option>
                                {standards.map(s => <option key={s._id} value={s._id}>Grade {s.level}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 italic font-outfit">Class Sector</label>
                        <div className="relative">
                            <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedStandard}
                                className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none transition-all appearance-none cursor-not-allowed disabled:opacity-50 text-sm font-bold font-outfit italic">
                                <option value="">Select Sector...</option>
                                {classes
                                    .filter(c => (c.standardId?._id || c.standardId) === selectedStandard)
                                    .map(c => <option key={c._id} value={c._id}>{c.sectionLabel}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 italic font-outfit">Temporal Date</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-md py-4 pl-14 pr-6 text-white outline-none transition-all text-sm font-bold font-outfit italic" />
                    </div>
                </div>
            </div>

            {selectedClass ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
                                <input type="text" placeholder="Filter IDs..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-md py-2 pl-12 pr-4 text-[10px] font-bold text-white w-48 focus:outline-none focus:border-brand-primary/40 transition-all font-outfit" />
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
                                            {['Student Identity', 'Admission Node', 'Verification Status', 'Actions'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {paginatedStudents.map((s, i) => (
                                            <React.Fragment key={s._id}>
                                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                                    className={`hover:bg-white/[0.02] transition-colors group ${expandedStudent === s._id ? 'bg-white/[0.03]' : ''}`}>
                                                    <td className="px-10 py-6">
                                                        <div className="font-bold text-white italic tracking-tight font-outfit uppercase">{s.firstName} {s.lastName}</div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="text-[11px] font-black text-slate-500 tracking-widest bg-slate-800/40 px-3 py-1.5 rounded-md border border-slate-700/50 uppercase font-outfit italic">#{s.admissionNumber}</span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex gap-2 flex-wrap">
                                                            {statusOptions.map(status => (
                                                                <button key={status} onClick={() => updateRecord(s._id, 'status', status)}
                                                                    className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all font-outfit ${records[s._id]?.status === status ? statusColor[status] : 'text-slate-600 bg-transparent border-slate-800 hover:border-slate-600'}`}>
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <button 
                                                            onClick={() => setExpandedStudent(expandedStudent === s._id ? null : s._id)}
                                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                                        >
                                                            {expandedStudent === s._id ? 'Collapse' : 'Details'}
                                                            <ChevronRight size={14} className={`transition-transform ${expandedStudent === s._id ? 'rotate-90' : ''}`} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                                <AnimatePresence>
                                                    {expandedStudent === s._id && (
                                                        <motion.tr 
                                                            initial={{ opacity: 0, height: 0 }} 
                                                            animate={{ opacity: 1, height: 'auto' }} 
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="bg-black/40 border-l-2 border-brand-primary"
                                                        >
                                                            <td colSpan="4" className="p-8">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                                    <div className="space-y-4">
                                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Temporal Tracking</label>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="relative">
                                                                                <Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                                                <input 
                                                                                    type="time" 
                                                                                    value={records[s._id]?.arrivalTime || ''} 
                                                                                    onChange={e => updateRecord(s._id, 'arrivalTime', e.target.value)}
                                                                                    className="w-full bg-slate-900 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary" 
                                                                                />
                                                                            </div>
                                                                            <div className="relative">
                                                                                <Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                                                <input 
                                                                                    type="time" 
                                                                                    value={records[s._id]?.departureTime || ''} 
                                                                                    onChange={e => updateRecord(s._id, 'departureTime', e.target.value)}
                                                                                    className="w-full bg-slate-900 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary" 
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Anomaly Flags</label>
                                                                        <div className="flex gap-4">
                                                                            <button 
                                                                                onClick={() => updateRecord(s._id, 'isLate', !records[s._id]?.isLate)}
                                                                                className={`flex-1 py-3 rounded-md border text-[10px] font-black uppercase transition-all ${records[s._id]?.isLate ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-900 text-slate-600 border-slate-800'}`}
                                                                            >
                                                                                Late Arrival
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => updateRecord(s._id, 'isEarlyLeave', !records[s._id]?.isEarlyLeave)}
                                                                                className={`flex-1 py-3 rounded-md border text-[10px] font-black uppercase transition-all ${records[s._id]?.isEarlyLeave ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-slate-900 text-slate-600 border-slate-800'}`}
                                                                            >
                                                                                Early Leave
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic block font-outfit">Pedagogical Remarks</label>
                                                                        <textarea 
                                                                            value={records[s._id]?.remarks || ''} 
                                                                            onChange={e => updateRecord(s._id, 'remarks', e.target.value)}
                                                                            placeholder="Enter Log Data..."
                                                                            className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-xs font-bold text-white outline-none focus:border-brand-primary h-14"
                                                                        />
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
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-outfit italic">
                                            Telemetry Page {currentPage} of {totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`p-2 rounded-md border transition-all ${currentPage === 1 ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button 
                                                        key={i + 1}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`w-8 h-8 rounded-md text-[10px] font-black transition-all font-outfit ${currentPage === i + 1 ? 'bg-brand-primary/20 border border-brand-primary text-brand-primary' : 'border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`p-2 rounded-md border transition-all ${currentPage === totalPages ? 'border-slate-800 text-slate-700 cursor-not-allowed' : 'border-slate-700 text-slate-400 hover:border-brand-primary hover:text-white'}`}
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    <div className="py-32 text-center border border-dashed border-slate-800 rounded-md bg-slate-900/10 shadow-inner">
                        <Clock size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                        <p className="text-slate-500 font-bold italic uppercase tracking-[0.4em] text-[10px] font-outfit">Awaiting Academic Sector Synchronization</p>
                    </div>

                    {attendance && attendance.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2 italic">Historical Log Archive</h3>
                            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-md overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/30">
                                            {['Date Node', 'Sector', 'Persistence Status'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {attendance.slice(0, 5).map((log) => (
                                            <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group cursor-pointer" 
                                                onClick={() => {
                                                    setSelectedStandard(log.standardId?._id || log.standardId);
                                                    setSelectedClass(log.classSection?._id || log.classSection);
                                                    setDate(new Date(log.date).toISOString().split('T')[0]);
                                                }}>
                                                <td className="px-10 py-5 text-sm font-bold text-slate-300 italic font-outfit">
                                                    {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-10 py-5">
                                                    <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest italic font-outfit">
                                                        {log.standardId ? `Grade ${log.standardId.level}-${log.classSection?.sectionLabel || '?'}` : `Grade ${log.classSection?.gradeLevel}-${log.classSection?.sectionLabel}`}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex -space-x-2">
                                                            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400 font-outfit italic">P</div>
                                                            <div className="w-6 h-6 rounded-md bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[10px] font-black text-red-500 font-outfit italic">A</div>
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-500 font-outfit italic">
                                                            {log.records?.filter(r => r.status === 'Present').length} / {log.records?.length} Verified
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;
