import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    fetchAssignedClasses,
    fetchClassStudents,
    fetchTeacherAttendance,
    submitAttendance,
    clearTeacherMessage,
    setTeacherError,
    importAttendanceBulk
} from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Save, Search, ChevronDown, Activity, Calendar, Users, Upload, FileText } from 'lucide-react';
import Modal from '../../components/Modal';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [isEditing, setIsEditing] = useState(true);

    const query = new URLSearchParams(location.search);
    const initialClassId = query.get('classId');

    const { classes, students, attendance, message, loading } = useSelector((state) => state.teacher);
    const [searchTerm, setSearchTerm] = useState('');

    const formik = useFormik({
        initialValues: {
            selectedClass: initialClassId || '',
            selectedDate: new Date().toISOString().split('T')[0],
            records: {} // { studentId: { status, arrivalTime, departureTime, isLate, isEarlyLeave, remarks } }
        },
        validationSchema: Yup.object({
            selectedClass: Yup.string().required('Class selection required'),
            selectedDate: Yup.date().required('Date selection required'),
        }),
        onSubmit: async (values) => {
            const recordsArr = Object.entries(values.records).map(([studentId, data]) => ({
                studentId,
                ...data
            }));

            if (recordsArr.length === 0) {
                return dispatch(setTeacherError("No student records found to save"));
            }

            dispatch(submitAttendance({
                classSectionId: values.selectedClass,
                date: values.selectedDate,
                records: recordsArr
            }));
        }
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    useEffect(() => {
        if (message && message.toLowerCase().includes('attendance')) {
            setIsEditing(false);
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

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

    useEffect(() => {
        if (students.length > 0) {
            const newRecords = {};
            students.forEach(s => {
                newRecords[s._id] = { status: 'Present', arrivalTime: '', departureTime: '', isLate: false, isEarlyLeave: false, remarks: '' };
            });

            const hasExistingAttendance = attendance && attendance.length > 0 && attendance[0].records;
            setIsEditing(!hasExistingAttendance);

            if (hasExistingAttendance) {
                attendance[0].records.forEach(r => {
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
            }
            formik.setFieldValue('records', newRecords);
        }
    }, [students, attendance]);

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusOptions = [
        { id: 'Present', icon: Check, color: 'text-luxury-emerald', bg: 'hover:bg-luxury-emerald/10' },
        { id: 'Late', icon: Clock, color: 'text-luxury-amber', bg: 'hover:bg-luxury-amber/10' },
        { id: 'Half-Day', icon: Activity, color: 'text-luxury-blue', bg: 'hover:bg-luxury-blue/10' },
        { id: 'Absent', icon: X, color: 'text-luxury-rose', bg: 'hover:bg-luxury-rose/10' },
    ];

    const [expandedStudent, setExpandedStudent] = useState(null);

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            // Format: admissionNumber,status
            const bulkData = lines.map(line => {
                const [admissionNumber, status] = line.split(',').map(s => s.trim());
                const student = students.find(s => s.admissionNumber === admissionNumber);
                return student ? { studentId: student._id, status: status || 'Present' } : null;
            }).filter(Boolean);

            if (bulkData.length > 0) {
                await dispatch(importAttendanceBulk({
                    classSectionId: formik.values.selectedClass,
                    date: formik.values.selectedDate,
                    attendanceData: bulkData
                }));
                setShowBulkModal(false);
                dispatch(fetchTeacherAttendance({
                    classId: formik.values.selectedClass,
                    date: formik.values.selectedDate
                }));
            }
        };
        reader.readAsText(csvFile);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Teacher Panel</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Mark Attendance</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Daily attendance registry for your assigned classes.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group min-w-[220px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                            name="selectedClass"
                            value={formik.values.selectedClass}
                            onChange={formik.handleChange}
                            className={`w-full bg-slate-900/80 border ${formik.touched.selectedClass && formik.errors.selectedClass ? 'border-luxury-rose' : 'border-slate-800'} h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic`}
                        >
                            <option value="" className="bg-slate-950 text-slate-600">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id} className="bg-slate-950 text-white italic">
                                    Std {cls.standardId?.level || cls.gradeLevel} - {cls.sectionLabel}
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
                            className="bg-slate-900/80 border border-slate-800 h-14 pl-14 pr-6 rounded-md text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary transition-all text-white shadow-xl italic"
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
                                placeholder="Search student by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-primary/60 outline-none h-14 pl-16 pr-6 rounded-md text-[12px] font-bold text-slate-100 shadow-2xl transition-all font-outfit italic tracking-wide"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                disabled={!isEditing}
                                onClick={() => {
                                    const updatedRecords = { ...formik.values.records };
                                    const recordsArr = students.map(s => {
                                        const r = {
                                            ...(updatedRecords[s._id] || { arrivalTime: '', departureTime: '', isLate: false, isEarlyLeave: false, remarks: '' }),
                                            status: 'Present',
                                            studentId: s._id
                                        };
                                        updatedRecords[s._id] = r;
                                        return r;
                                    });

                                    formik.setFieldValue('records', updatedRecords);
                                    
                                    dispatch(submitAttendance({
                                        classSectionId: formik.values.selectedClass,
                                        date: formik.values.selectedDate,
                                        records: recordsArr
                                    }));
                                }}
                                className="px-6 h-14 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-black text-[11px] uppercase tracking-widest transition-all italic disabled:opacity-20"
                            >
                                Mark All Present
                            </button>

                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 hover:border-brand-primary text-slate-300 px-10 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[11px] transition-all shadow-xl font-outfit italic"
                                >
                                    <Clock size={20} className="text-brand-primary" /> Edit Attendance
                                </button>
                            ) : (
                                <button
                                    onClick={formik.handleSubmit}
                                    disabled={loading || students.length === 0}
                                    className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-teacher-primary text-white px-10 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[11px] transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50 font-outfit italic"
                                >
                                    {loading ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                                    {attendance && attendance.length > 0 ? 'Update Attendance' : 'Save Attendance'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-md shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/60 border-b border-slate-800/50">
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-outfit">Student Name</th>
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
                                                                {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0" /> : <Activity size={20} />}
                                                            </div>
                                                            <div>
                                                                <p
                                                                    onClick={() => navigate(`/teacher/profile/${student._id}`)}
                                                                    className="text-base font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-2 cursor-pointer hover:text-brand-primary transition-colors"
                                                                >
                                                                    {student.firstName} {student.lastName}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Roll No/Adm No: {student.admissionNumber || '—'}</p>
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
                                                                    onClick={() => formik.setFieldValue(`records.${student._id}.status`, status.id)}
                                                                    className={`flex items-center gap-2 px-4 h-11 rounded-md border transition-all duration-500 font-outfit italic disabled:opacity-50 ${formik.values.records[student._id]?.status === status.id ? `bg-slate-900 border-slate-700 ${status.color} shadow-2xl scale-[1.05] ring-2 ring-slate-900/50` : `border-slate-800/30 text-slate-600 bg-transparent ${status.bg} hover:border-slate-700`}`}
                                                                >
                                                                    <status.icon size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">{status.id}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7 text-center">
                                                        <button type="button" onClick={() => setExpandedStudent(expandedStudent === student._id ? null : student._id)} className={`p-3 rounded-md transition-all ${expandedStudent === student._id ? 'bg-brand-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
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
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Arrival Time</label>
                                                                        <div className="relative">
                                                                            <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                                            <input
                                                                                type="time"
                                                                                disabled={!isEditing}
                                                                                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-md h-11 pl-12 shadow-inner text-xs font-bold text-white font-outfit disabled:opacity-40"
                                                                                value={formik.values.records[student._id]?.arrivalTime}
                                                                                onChange={(e) => formik.setFieldValue(`records.${student._id}.arrivalTime`, e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-3">
                                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Teacher Notes</label>
                                                                        <textarea
                                                                            disabled={!isEditing}
                                                                            className="w-full bg-slate-950/50 border border-slate-800/60 rounded-md p-4 text-xs font-bold text-white font-outfit min-h-[90px] resize-none italic disabled:opacity-40"
                                                                            placeholder="Add any remarks or notes here..."
                                                                            value={formik.values.records[student._id]?.remarks}
                                                                            onChange={(e) => formik.setFieldValue(`records.${student._id}.remarks`, e.target.value)}
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
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-800/40 rounded-md bg-slate-900/20 shadow-inner">
                    <Activity size={60} className="text-slate-800 mb-8 opacity-20" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[12px] italic">Please select a class to mark attendance</p>
                </div>
            )}

            <Modal open={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Attendance Upload">
                <div className="space-y-6 pt-4">
                    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-md group hover:border-brand-primary/40 transition-all cursor-pointer relative overflow-hidden">
                        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="flex flex-col items-center justify-center gap-4 py-10">
                            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-brand-primary group-hover:scale-110 transition-all shadow-2xl">
                                <FileText size={40} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-white italic uppercase">{csvFile ? csvFile.name : 'Select Attendance CSV'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Format: admissionNumber,status</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleBulkUpload} disabled={!csvFile} className="w-full py-5 bg-brand-primary hover:bg-teacher-primary disabled:opacity-50 text-white rounded-md font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 italic">
                        <Upload size={18} /> Upload Attendance
                    </button>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight text-center leading-relaxed italic">
                        Note: Bulk upload will overwrite any existing attendance records for the selected class and date.
                    </p>
                </div>
            </Modal>
        </motion.div>
    );
};

export default MarkAttendance;
