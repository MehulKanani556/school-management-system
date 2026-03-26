import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
    fetchAssignedClasses, 
    fetchClassStudents, 
    fetchExamSchedule, 
    fetchTeacherMarks,
    submitMarks, 
    clearTeacherMessage 
} from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Search, ChevronDown, Activity, Award, BookOpen, User, CheckCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const AddMarks = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialClassId = query.get('classId');
    const initialExamId = query.get('examId');

    const [isGlobalEditMode, setIsGlobalEditMode] = useState(true);
    const hasInitializedInitialExam = useRef(false);

    const { classes, students, exams, marks, message, loading } = useSelector((state) => state.teacher);
    const [searchTerm, setSearchTerm] = useState('');

    const formik = useFormik({
        initialValues: {
            selectedClass: initialClassId || '',
            selectedExam: initialExamId || '',
            marksData: {} // { studentId: { score: '', remarks: '' } }
        },
        validationSchema: Yup.object({
            selectedClass: Yup.string().required('Academic section required'),
            selectedExam: Yup.string().required('Assessment node selection required'),
        }),
        onSubmit: async (values) => {
            const studentMarksArr = Object.entries(values.marksData).map(([studentId, data]) => ({
                studentId,
                score: data.score,
                remarks: data.remarks
            }));

            if (studentMarksArr.length === 0) {
                return toast.error("No assessment data detected for submission");
            }

            const result = await dispatch(submitMarks({ 
                examId: values.selectedExam, 
                studentMarks: studentMarksArr 
            }));

            if (submitMarks.fulfilled.match(result)) {
                dispatch(fetchTeacherMarks(values.selectedExam));
                setIsGlobalEditMode(false); // Relock after sync
            }
        }
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    // Fetch dependencies when class changes
    useEffect(() => {
        if (formik.values.selectedClass) {
            dispatch(fetchClassStudents(formik.values.selectedClass));
            dispatch(fetchExamSchedule(formik.values.selectedClass));
            
            if (initialExamId && !hasInitializedInitialExam.current && formik.values.selectedClass === initialClassId) {
                // Do not clear the exam on initial hydration from schedule routing
                hasInitializedInitialExam.current = true;
            } else {
                formik.setFieldValue('selectedExam', ''); // Reset exam on subsequent class changes
            }
            setIsGlobalEditMode(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.selectedClass, dispatch, initialExamId, initialClassId]);

    // Fetch existing marks when exam changes
    useEffect(() => {
        if (formik.values.selectedExam) {
            dispatch(fetchTeacherMarks(formik.values.selectedExam));
        }
    }, [formik.values.selectedExam, dispatch]);

    // Synchronize marksData when students or existing marks change
    useEffect(() => {
        if (students.length > 0) {
            const initial = {};
            
            // First pass: Default empty
            students.forEach(s => { 
                initial[s._id] = { score: '', remarks: '' }; 
            });

            // Second pass: Apply existing marks if found and LOCK them
            if (marks && marks.length > 0) {
                marks.forEach(m => {
                    const id = m.studentId?._id || m.studentId;
                    if (id) {
                        initial[id] = { 
                            score: m.marksObtained !== undefined ? m.marksObtained : '', 
                            remarks: m.remarks || '' 
                        };
                    }
                });
                setIsGlobalEditMode(false); // Lock if existing
            } else {
                setIsGlobalEditMode(true); // Editable for new entries
            }
            
            formik.setFieldValue('marksData', initial);
        }
    }, [students, marks]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
        }
    }, [message, dispatch]);

    const filteredStudents = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary font-outfit">Evaluation HUB</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Performance Registry</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Digital archival of numerical & qualitative assessment results.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group min-w-[200px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <BookOpen size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                            name="selectedClass"
                            value={formik.values.selectedClass}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full bg-slate-900/80 border ${formik.touched.selectedClass && formik.errors.selectedClass ? 'border-luxury-rose' : 'border-slate-800'} h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic`}
                        >
                            <option value="" className="bg-slate-950 text-slate-600">Select Section</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id} className="bg-slate-950 text-white italic">
                                    Grade {cls.standardId?.level} - {cls.sectionLabel}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group min-w-[200px]">
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <Award size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                            name="selectedExam"
                            value={formik.values.selectedExam}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={!formik.values.selectedClass}
                            className={`w-full bg-slate-900/80 border ${formik.touched.selectedExam && formik.errors.selectedExam ? 'border-luxury-rose' : 'border-slate-800'} h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white shadow-xl italic disabled:opacity-40`}
                        >
                            <option value="" className="bg-slate-950 text-slate-600">Select Assessment</option>
                            {exams.map(ex => (
                                <option key={ex._id} value={ex._id} className="bg-slate-950 text-white italic uppercase tracking-tighter">
                                    {ex.title} [{ex.type?.replace('_', ' ')}]
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {formik.values.selectedClass && formik.values.selectedExam ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                        <div className="relative group flex-1 max-w-md">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Identify student by name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-primary/60 outline-none h-14 pl-16 pr-6 rounded-md text-[12px] font-bold text-slate-100 shadow-2xl transition-all font-outfit italic tracking-wide"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {!isGlobalEditMode && marks.length > 0 && (
                                <button
                                    onClick={() => setIsGlobalEditMode(true)}
                                    className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-slate-300 px-8 h-14 rounded-md font-black tracking-widest uppercase text-[10px] border border-slate-800 hover:border-brand-primary/40 transition-all shadow-xl active:scale-95 font-outfit italic"
                                >
                                    <Pencil size={14} />
                                    Modify Registry
                                </button>
                            )}
                            <button 
                                onClick={formik.handleSubmit}
                                disabled={loading || students.length === 0}
                                className={`flex items-center justify-center gap-3 ${isGlobalEditMode ? 'bg-brand-primary' : 'bg-luxury-emerald/20 border border-luxury-emerald/40 text-luxury-emerald'} hover:scale-[1.02] text-white px-10 h-14 rounded-md font-black tracking-[0.2em] uppercase text-[11px] transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 disabled:opacity-50 font-outfit italic`}
                            >
                                {loading ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                                {isGlobalEditMode ? 'Synchronize Grades' : 'Synchronized ✓'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-md shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/60 border-b border-slate-800/50">
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-outfit">Student Identity</th>
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-center font-outfit">
                                            Quantitative Performance 
                                            <span className="block text-brand-primary opacity-60 mt-2 tracking-widest leading-none">
                                                [MAX: {exams.find(ex => ex._id === formik.values.selectedExam)?.maxMarks || 100}]
                                            </span>
                                        </th>
                                        <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic font-outfit">Institutional Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredStudents.map((student, idx) => (
                                                <motion.tr 
                                                    key={student._id} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <td className="px-12 py-7">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 text-sm overflow-hidden shadow-inner group-hover:border-brand-primary/40 transition-all duration-500">
                                                                {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /> : <User size={20} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-black text-white italic tracking-tight uppercase font-outfit leading-none mb-2 group-hover:text-brand-primary transition-colors duration-500">{student.firstName} {student.lastName}</p>
                                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Seat: #{student.rollNumber || student.admissionNumber || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-7 text-center">
                                                        <div className="flex justify-center items-center gap-4">
                                                            {!isGlobalEditMode ? (
                                                                <div className="w-32 bg-slate-900 border border-slate-800/40 h-14 flex items-center justify-center rounded-md text-base font-black text-brand-primary font-outfit italic opacity-60">
                                                                    {formik.values.marksData[student._id]?.score || '--'}
                                                                </div>
                                                            ) : (
                                                                <div className="relative w-32 animate-in zoom-in-95 duration-200">
                                                                    <input 
                                                                        type="number"
                                                                        placeholder="Score..."
                                                                        value={formik.values.marksData[student._id]?.score || ''}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const selectedExamObj = exams.find(ex => ex._id === formik.values.selectedExam);
                                                                            const maxAllowed = selectedExamObj?.maxMarks || 100;
                                                                            
                                                                            if (val === '') {
                                                                                formik.setFieldValue(`marksData.${student._id}.score`, '');
                                                                                return;
                                                                            }

                                                                            if (Number(val) > maxAllowed) {
                                                                                toast.error(`Entry Error: Mark exceeds assessment maximum [MAX: ${maxAllowed}]`, {
                                                                                    id: 'max-mark-error',
                                                                                    style: {
                                                                                        borderRadius: '1.5rem',
                                                                                        background: '#0f172a',
                                                                                        color: '#fff',
                                                                                        border: '1px solid #ef4444',
                                                                                        fontSize: '11px',
                                                                                        fontWeight: 900,
                                                                                        textTransform: 'uppercase',
                                                                                    }
                                                                                });
                                                                                return;
                                                                            }
                                                                            formik.setFieldValue(`marksData.${student._id}.score`, val);
                                                                        }}
                                                                        className="w-full bg-slate-900/60 border border-brand-primary/60 h-14 px-6 rounded-md text-center text-base font-black text-white outline-none bg-slate-900 transition-all italic font-outfit shadow-2xl placeholder:text-slate-800"
                                                                    />
                                                                    <div 
                                                                        className="absolute -bottom-2 -right-2 w-7 h-7 bg-brand-primary border border-slate-900 rounded-md flex items-center justify-center shadow-lg" 
                                                                        title="Draft Mode Active"
                                                                    >
                                                                        <CheckCircle size={10} className="text-black" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-7">
                                                        <input 
                                                            type="text"
                                                            placeholder="Nomenclature observation..."
                                                            value={formik.values.marksData[student._id]?.remarks || ''}
                                                            disabled={!isGlobalEditMode}
                                                            onChange={(e) => formik.setFieldValue(`marksData.${student._id}.remarks`, e.target.value)}
                                                            className={`w-full h-14 px-8 rounded-md text-[12px] font-medium outline-none transition-all font-outfit italic tracking-wide shadow-lg placeholder:text-slate-800 ${!isGlobalEditMode ? 'bg-transparent border-transparent text-slate-700 cursor-not-allowed italic opacity-30 font-bold' : 'bg-slate-900/40 border border-slate-800/50 text-slate-300 focus:border-brand-primary focus:bg-slate-900/80'}`}
                                                        />
                                                    </td>
                                                </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-48 border-2 border-dashed border-slate-800/40 rounded-md bg-slate-900/20 backdrop-blur-sm group hover:border-brand-primary/20 transition-all duration-1000">
                    <Award size={60} className="text-slate-800 mb-8 opacity-20 group-hover:text-brand-primary/20 group-hover:scale-110 transition-all duration-1000 animate-pulse underline" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[12px] font-outfit italic group-hover:text-slate-500 transition-colors">Awaiting Assessment Synchronization</p>
                    <p className="text-slate-700 text-[9px] mt-4 font-bold tracking-widest uppercase">Select an academic sector and assessment node to initiate registry</p>
                </div>
            )}
        </motion.div>
    );
};

export default AddMarks;
