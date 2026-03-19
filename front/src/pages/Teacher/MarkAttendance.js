import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchAssignedClasses, fetchClassStudents, submitAttendance, clearTeacherMessage } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Save, Search, ChevronDown, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialClassId = query.get('classId');

    const { classes, students, message, loading } = useSelector((state) => state.teacher);
    const [selectedClass, setSelectedClass] = useState(initialClassId || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassStudents(selectedClass));
        }
    }, [selectedClass, dispatch]);

    useEffect(() => {
        if (students.length > 0) {
            const initial = {};
            students.forEach(s => { initial[s._id] = 'Present'; });
            setAttendanceData(initial);
        }
    }, [students]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = () => {
        const records = Object.keys(attendanceData).map(id => ({
            student: id,
            status: attendanceData[id]
        }));
        dispatch(submitAttendance({ classSection: selectedClass, date, records }));
    };

    const filteredStudents = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit">Attendance Terminal</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Daily node presence tracking. Standard protocol for all assigned sectors.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group min-w-[200px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-800/40 border border-slate-700/50 h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white"
                        >
                            <option value="" className="bg-slate-900 text-slate-500">Select Section</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id} className="bg-slate-900 text-white">
                                    Grade {cls.gradeLevel} - {cls.sectionLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-slate-800/40 border border-slate-700/50 h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white"
                    />
                </div>
            </header>

            {selectedClass ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="relative group flex-1 max-w-sm">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Locate student by name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-primary/60 outline-none h-11 pl-11 pr-4 rounded-xl text-[11px] font-bold text-slate-100 shadow-2xl transition-all"
                            />
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={loading || students.length === 0}
                            className="flex items-center gap-3 bg-brand-primary hover:bg-blue-600 text-white px-8 h-11 rounded-xl font-black tracking-widest uppercase text-[10px] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                            Archive Records
                        </button>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/40 border-b border-slate-800/60">
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-center">Protocol Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="group hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-black text-slate-500 text-xs overflow-hidden">
                                                        {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : <Activity size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-1 group-hover:text-brand-primary transition-colors">{student.firstName} {student.lastName}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Roll: {student.rollNumber || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-center gap-3">
                                                    {[
                                                        { id: 'Present', icon: Check, color: 'text-luxury-emerald', bg: 'hover:bg-luxury-emerald/10' },
                                                        { id: 'Absent', icon: X, color: 'text-luxury-rose', bg: 'hover:bg-luxury-rose/10' },
                                                        { id: 'Late', icon: Clock, color: 'text-amber-500', bg: 'hover:bg-amber-500/10' },
                                                    ].map(status => (
                                                        <button
                                                            key={status.id}
                                                            onClick={() => handleStatusChange(student._id, status.id)}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${
                                                                attendanceData[student._id] === status.id 
                                                                ? `bg-slate-800 border-slate-600 ${status.color} shadow-lg scale-[1.05]` 
                                                                : `border-slate-800/50 text-slate-500 bg-transparent ${status.bg}`
                                                            }`}
                                                        >
                                                            <status.icon size={14} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{status.id}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="px-8 py-20 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">No matching students found in this node</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/40">
                    <Activity size={40} className="text-slate-700 mb-6 animate-pulse" />
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] font-outfit">Select a class section to initiate tracking</p>
                </div>
            )}
        </motion.div>
    );
};

export default MarkAttendance;
