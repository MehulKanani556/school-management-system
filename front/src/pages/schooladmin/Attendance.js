import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, fetchStudents, fetchAttendance, saveAttendance } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users, Search } from 'lucide-react';

const statusOptions = ['Present', 'Absent'];
const statusIcon = { Present: CheckCircle, Absent: XCircle };
const statusColor = {
    Present: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Absent: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const Attendance = () => {
    const dispatch = useDispatch();
    const { classes, students, attendance, loading } = useSelector((s) => s.schoolAdmin);
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchStudents());
    }, [dispatch]);

    // Fetch existing attendance when class/date changes
    useEffect(() => {
        if (selectedClass && date) {
            dispatch(fetchAttendance({ classSection: selectedClass, date })).then((res) => {
                const existing = res.payload?.[0];
                const currentStudents = students.filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);
                
                const newRecords = {};
                if (existing && existing.records) {
                    existing.records.forEach(r => {
                        const id = r.studentId?._id || r.studentId;
                        if (id) newRecords[id] = r.status;
                    });
                } else {
                    currentStudents.forEach(s => {
                        newRecords[s._id] = 'Present';
                    });
                }
                setRecords(newRecords);
            });
        }
    }, [selectedClass, date, dispatch, students]);

    const classStudents = students.filter(s => s.classSection?._id === selectedClass || s.classSection === selectedClass);
    
    const filteredStudents = classStudents.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        const recordsArr = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
        await dispatch(saveAttendance({ classSection: selectedClass, date, records: recordsArr }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const markAllPresent = () => {
        const newRecords = { ...records };
        filteredStudents.forEach(s => { newRecords[s._id] = 'Present'; });
        setRecords(newRecords);
    };

    const summary = statusOptions.map(s => ({ 
        status: s, 
        count: Object.values(records).filter(r => r === s).length 
    }));

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit text-shadow-glow">Presence Node</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Institutional attendance telemetry & marking terminal.</p>
                </div>
                {selectedClass && classStudents.length > 0 && (
                    <div className="flex gap-4">
                        <button onClick={markAllPresent} 
                            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                            Mass Presence
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            {loading ? <AlertCircle className="animate-spin" size={18} /> : <Save size={18} />} {saved ? 'System Updated!' : 'Commit Attendance'}
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Sector Assignment</label>
                    <div className="relative">
                        <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                            className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-2xl py-4 pl-14 pr-6 text-white outline-none transition-all appearance-none cursor-pointer text-sm font-bold">
                            <option value="">Select Academic Sector...</option>
                            {classes.map(c => <option key={c._id} value={c._id}>Grade {c.gradeLevel} - Sector {c.sectionLabel}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Temporal Date</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-[#0f0f12] border border-slate-800 focus:border-brand-primary rounded-2xl py-4 pl-14 pr-6 text-white outline-none transition-all text-sm font-bold" />
                    </div>
                </div>
            </div>

            {selectedClass ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {summary.map(({ status, count }) => {
                            const Icon = statusIcon[status];
                            return (
                                <div key={status} className={`flex items-center gap-4 px-6 py-6 rounded-[2rem] border backdrop-blur-xl ${statusColor[status]}`}>
                                    <div className="p-3 bg-white/5 rounded-xl"><Icon size={20} /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{status}</p>
                                        <p className="text-2xl font-black font-outfit leading-none">{count}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
                        <div className="p-8 border-b border-slate-800/40 flex items-center justify-between bg-black/20">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 font-outfit">Student Cluster - {filteredStudents.length} Nodes</h3>
                            <div className="relative group">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-brand-primary transition-colors" />
                                <input type="text" placeholder="Filter IDs..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-12 pr-4 text-[10px] font-bold text-white w-48 focus:outline-none focus:border-brand-primary/40 transition-all font-outfit" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {filteredStudents.length === 0 ? (
                                <div className="py-24 text-center">
                                    <Users size={48} className="text-slate-800 mx-auto mb-4 opacity-20 underline" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">No Student Nodes Detected in this Sector</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/30">
                                            {['Student Identity', 'Admission Node', 'Verification Status'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {filteredStudents.map((s, i) => (
                                            <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                                className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="font-bold text-white italic tracking-tight">{s.firstName} {s.lastName}</div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-[11px] font-black text-slate-500 tracking-widest bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50 uppercase font-outfit italic">#{s.admissionNumber}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {statusOptions.map(status => (
                                                            <button key={status} onClick={() => setRecords(r => ({ ...r, [s._id]: status }))}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all font-outfit ${records[s._id] === status ? statusColor[status] : 'text-slate-600 bg-transparent border-slate-800 hover:border-slate-600'}`}>
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    <div className="py-32 text-center border border-dashed border-slate-800 rounded-[4rem] bg-slate-900/10">
                        <Clock size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                        <p className="text-slate-500 font-bold italic uppercase tracking-[0.4em] text-[10px]">Awaiting Academic Sector Synchronization</p>
                    </div>

                    {attendance && attendance.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2 italic">Historical Log Archive</h3>
                            <div className="bg-[#0f0f12] border border-slate-800/60 rounded-[3rem] overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/30">
                                            {['Date Node', 'Sector', 'Persistence Status'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {attendance.slice(0, 5).map((log) => (
                                            <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group cursor-pointer" 
                                                onClick={() => {
                                                    setSelectedClass(log.classSection?._id || log.classSection);
                                                    setDate(new Date(log.date).toISOString().split('T')[0]);
                                                }}>
                                                <td className="px-10 py-5 text-sm font-bold text-slate-300 italic font-outfit">
                                                    {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-10 py-5">
                                                    <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest italic">
                                                        Grade {log.classSection?.gradeLevel}-{log.classSection?.sectionLabel}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex -space-x-2">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">P</div>
                                                            <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[10px] font-black text-red-500">A</div>
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-500">
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
