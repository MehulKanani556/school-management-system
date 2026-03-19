import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
    fetchAssignedClasses, 
    fetchClassStudents, 
    fetchTeacherAttendance,
    submitAttendance, 
    clearTeacherMessage 
} from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Save, Search, ChevronDown, Activity, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialClassId = query.get('classId');

    const { classes, students, attendance, message, loading } = useSelector((state) => state.teacher);
    const [searchTerm, setSearchTerm] = useState('');

    const formik = useFormik({
        initialValues: {
            selectedClass: initialClassId || '',
            selectedDate: new Date().toISOString().split('T')[0],
            records: {} // { studentId: status }
        },
        validationSchema: Yup.object({
            selectedClass: Yup.string().required('Section selection required'),
            selectedDate: Yup.date().required('Date selection required'),
        }),
        onSubmit: async (values) => {
            const recordsArr = Object.entries(values.records).map(([studentId, status]) => ({
                studentId: studentId,
                status: status
            }));

            if (recordsArr.length === 0) {
                return toast.error("No student nodes detected for commitment");
            }

            dispatch(submitAttendance({ 
                classSection: values.selectedClass, 
                date: values.selectedDate, 
                records: recordsArr 
            }));
        }
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    // Fetch students and existing attendance when class/date changes
    useEffect(() => {
        if (formik.values.selectedClass) {
            dispatch(fetchClassStudents(formik.values.selectedClass));
        }
    }, [formik.values.selectedClass, dispatch]);

    useEffect(() => {
        if (formik.values.selectedClass && formik.values.selectedDate) {
            dispatch(fetchTeacherAttendance({ 
                classId: formik.values.selectedClass, 
                date: formik.values.selectedDate 
            }));
        }
    }, [formik.values.selectedClass, formik.values.selectedDate, dispatch]);

    // Synchronize records when students or attendance data changes
    useEffect(() => {
        if (students.length > 0) {
            const newRecords = {};
            
            // First pass: Default to Present
            students.forEach(s => { newRecords[s._id] = 'Present'; });

            // Second pass: Apply existing attendance if found
            if (attendance && attendance.length > 0 && attendance[0].records) {
                attendance[0].records.forEach(r => {
                    const id = r.student?._id || r.student;
                    if (id) newRecords[id] = r.status;
                });
            }
            
            formik.setFieldValue('records', newRecords);
        }
    }, [students, attendance]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

    const filteredStudents = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { id: 'Present', icon: Check, color: 'text-luxury-emerald', bg: 'hover:bg-luxury-emerald/10' },
        { id: 'Absent', icon: X, color: 'text-luxury-rose', bg: 'hover:bg-luxury-rose/10' },
    ];

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Teacher Terminal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Attendance Registry</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Institutional node tracking for assigned academic sectors.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group min-w-[220px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                            name="selectedClass"
                            value={formik.values.selectedClass}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full bg-slate-900/80 border ${formik.touched.selectedClass && formik.errors.selectedClass ? 'border-luxury-rose' : 'border-slate-800'} h-14 pl-14 pr-8 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic`}
                        >
                            <option value="" className="bg-slate-950 text-slate-600">Select Section</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id} className="bg-slate-950 text-white italic">
                                    Grade {cls.gradeLevel} - {cls.sectionLabel}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="date" 
                            name="selectedDate"
                            value={formik.values.selectedDate}
                            onChange={formik.handleChange}
                            className="bg-slate-900/80 border border-slate-800 h-14 pl-14 pr-6 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white shadow-xl italic"
                        />
                    </div>
                </div>
            </header>

            {formik.values.selectedClass ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                        <div className="relative group flex-1 max-w-md">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Identify student by nomenclature..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-primary/60 outline-none h-14 pl-16 pr-6 rounded-2xl text-[12px] font-bold text-slate-100 shadow-2xl transition-all font-outfit italic tracking-wide"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => {
                                    const newRecords = { ...formik.values.records };
                                    filteredStudents.forEach(s => { newRecords[s._id] = 'Present'; });
                                    formik.setFieldValue('records', newRecords);
                                }}
                                className="px-6 h-14 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all italic"
                            >
                                Mass Presence
                            </button>
                            <button 
                                onClick={formik.handleSubmit}
                                disabled={loading || students.length === 0}
                                className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-blue-600 text-white px-10 h-14 rounded-2xl font-black tracking-[0.2em] uppercase text-[11px] transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50 font-outfit italic"
                            >
                                {loading ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                                Commit Records
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/60 border-b border-slate-800/50">
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-outfit">Student Identity</th>
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center font-outfit">Verification Protocol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredStudents.map((student, idx) => (
                                            <motion.tr 
                                                key={student._id} 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-12 py-7">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 text-sm overflow-hidden shadow-inner group-hover:border-brand-primary/40 transition-all duration-500">
                                                            {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /> : <Activity size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-2 group-hover:text-brand-primary transition-colors duration-500">{student.firstName} {student.lastName}</p>
                                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Node Ref: {student.admissionNumber || '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-7">
                                                    <div className="flex items-center justify-center gap-4">
                                                        {statusOptions.map(status => (
                                                            <button
                                                                key={status.id}
                                                                type="button"
                                                                onClick={() => formik.setFieldValue(`records.${student._id}`, status.id)}
                                                                className={`flex items-center gap-3 px-6 h-12 rounded-2xl border transition-all duration-500 font-outfit italic ${
                                                                    formik.values.records[student._id] === status.id 
                                                                    ? `bg-slate-900 border-slate-700 ${status.color} shadow-2xl scale-[1.08] ring-4 ring-slate-900/50` 
                                                                    : `border-slate-800/50 text-slate-600 bg-transparent ${status.bg} hover:border-slate-700`
                                                                }`}
                                                            >
                                                                <status.icon size={16} />
                                                                <span className="text-[11px] font-black uppercase tracking-widest">{status.id}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="px-8 py-32 text-center">
                                                <Activity size={48} className="text-slate-800 mx-auto mb-6 opacity-20 animate-pulse" />
                                                <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-[11px] italic font-outfit">No student nodes synchronized in this sector</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-800/40 rounded-[4rem] bg-slate-900/20 backdrop-blur-sm group hover:border-brand-primary/20 transition-all duration-1000">
                        <Activity size={60} className="text-slate-800 mb-8 opacity-20 group-hover:text-brand-primary/20 group-hover:scale-110 transition-all duration-1000 animate-pulse" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[12px] font-outfit italic group-hover:text-slate-500 transition-colors">Awaiting Sector Synchronization</p>
                        <p className="text-slate-700 text-[9px] mt-4 font-bold tracking-widest uppercase italic font-outfit">Select an academic sector to initiate tracking terminal</p>
                    </div>

                    {attendance && attendance.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 font-outfit px-2 italic">Historical Presence Logs</h3>
                            <div className="bg-slate-950/80 border border-slate-800/80 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl group hover:border-brand-primary/20 transition-all duration-700">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/60">
                                            {['Sector Node', 'Date Node', 'Verification Status'].map(h => (
                                                <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-outfit italic">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                        {attendance.slice(0, 5).map((log) => (
                                            <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group cursor-pointer" 
                                                onClick={() => {
                                                    formik.setFieldValue('selectedClass', log.classSection?._id || log.classSection);
                                                    formik.setFieldValue('selectedDate', new Date(log.date).toISOString().split('T')[0]);
                                                }}>
                                                <td className="px-10 py-5">
                                                    <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest italic font-outfit shadow-glow">
                                                        {log.classSection?.gradeLevel}-{log.classSection?.sectionLabel} Log
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-[12px] font-bold text-slate-300 italic font-outfit tracking-tighter">
                                                    {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-10 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={12} className="text-luxury-emerald opacity-50 shadow-glow" />
                                                        <span className="text-[11px] font-bold text-slate-500 italic font-outfit">
                                                            {log.records?.filter(r => r.status === 'Present').length} / {log.records?.length} Nodes Verified
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
        </motion.div>
    );
};

export default MarkAttendance;
