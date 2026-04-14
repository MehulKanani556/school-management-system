import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Info, ArrowLeft, Loader2, Calendar, Award, CheckCircle, XCircle, TrendingUp, RotateCcw } from 'lucide-react';
import { fetchClassStudents, fetchStudentDetail, generateRollNumbers } from '../../redux/slice/teacher.slice';
import toast from 'react-hot-toast';


import Modal from '../../components/Modal';

const ClassStudents = () => {
    const { classId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { students, studentDetail, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (activeAcademicYearId) {
            console.log('👥 Class Students - Academic Year Changed:', activeAcademicYearId);
            dispatch(fetchClassStudents(classId));
        }
    }, [dispatch, classId, activeAcademicYearId]);

    const handleViewDetail = (studentId) => {
        dispatch(fetchStudentDetail(studentId));
        setSelectedStudent(studentId);
    };

    const handleGenerateRollNumbers = async () => {
        if (window.confirm('Do you want to re-synchronize roll sequence based on gender (girls first) and name?')) {
            setIsGenerating(true);
            try {
                const result = await dispatch(generateRollNumbers(classId)).unwrap();
                toast.success(result.message || 'Roll numbers updated successfully');
            } catch (error) {
                toast.error(error || 'Failed to update roll numbers');
            } finally {
                setIsGenerating(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link to="/teacher/classes" className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-md text-slate-400 hover:text-white transition-all hover:scale-105 shadow-xl">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 font-outfit">Student Registry</h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Active Academic Sector Population</p>
                    </div>
                </div>

                <button
                    onClick={handleGenerateRollNumbers}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 border border-brand-primary/20"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    Sync Roll sequence
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student, idx) => (
                    <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900/40 border border-slate-800/80 rounded-md p-8 shadow-2xl relative overflow-hidden group hover:border-brand-primary/40 transition-all backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 rounded-md bg-slate-800 border border-slate-700/50 overflow-hidden shadow-xl">
                                {student.photo ? <img src={student.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-600 font-outfit uppercase">{student.firstName.charAt(0)}</div>}
                            </div>
                            <div 
                                className="cursor-pointer group/name"
                                onClick={() => navigate(`/teacher/profile/${student._id}`)}
                            >
                                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter font-outfit leading-tight mb-1 group-hover/name:text-brand-primary transition-colors">{student.firstName} <br /> {student.lastName}</h4>
                                <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{student.studentId || student.admissionNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
                                <span>Roll Sequence</span>
                                <span className="text-slate-300 italic">#{student.rollNumber || 'N/A'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleViewDetail(student._id)}
                            className="w-full py-4 bg-slate-800/80 hover:bg-brand-primary rounded-md text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-all border border-slate-700/50 flex items-center justify-center gap-3 shadow-xl active:scale-95"
                        >
                            <Info size={14} /> Intelligence Profile
                        </button>
                    </motion.div>
                ))}
            </div>

            <Modal open={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Intelligence Terminal">
                {(!studentDetail || loading) ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-brand-primary w-10 h-10 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting Profile Metadata</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        <section className="flex items-center gap-8 p-6 bg-slate-800/30 rounded-md border border-slate-700/30 shadow-inner">
                            <div className="w-24 h-24 rounded-md bg-slate-800 border-2 border-slate-700/50 overflow-hidden shadow-2xl">
                                {studentDetail.student.photo ? <img src={studentDetail.student.photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-700 font-outfit uppercase">{studentDetail.student.firstName.charAt(0)}</div>}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 font-outfit">{studentDetail.student.firstName} {studentDetail.student.lastName}</h2>
                                <div className="flex gap-3">
                                    <span className="text-[9px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest italic">{studentDetail.student.studentId}</span>
                                    <span className="text-[9px] bg-teacher-primary/10 text-teacher-primary border border-teacher-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest italic">Node Verified</span>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 italic"> <Calendar size={14} className="text-brand-primary" /> Attendance Vector</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {studentDetail.attendance.slice(-20).map((a, i) => (
                                        <div key={i} title={new Date(a.date).toLocaleDateString()} className={`h-6 rounded-md flex items-center justify-center border ${a.status === 'Present' ? 'bg-teacher-primary/10 border-teacher-primary/20 text-teacher-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'} transition-all hover:scale-110 cursor-help shadow-lg`}>
                                            {a.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to={`/teacher/student-attendance/${selectedStudent}`}
                                    className="w-full mt-6 py-4 bg-slate-800/80 hover:bg-brand-primary rounded-md flex items-center justify-center gap-3 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] border border-slate-700/50 shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Full Telemetry Log <TrendingUp size={14} />
                                </Link>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 italic"> <Award size={14} className="text-brand-secondary" /> Examination Metrics</h3>
                                <div className="space-y-3">
                                    {studentDetail.exams.length > 0 ? studentDetail.exams.map((e, i) => (
                                        <div key={i} className="p-4 bg-slate-800/40 rounded-md border border-slate-700/30 flex justify-between items-center shadow-lg">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">{e.subject}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">{e.title}</p>
                                            </div>
                                            <p className="text-sm font-black text-brand-secondary italic">{e.score}<span className="text-[10px] opacity-40 ml-1">/{e.maxMarks}</span></p>
                                        </div>
                                    )) : <p className="text-[10px] text-slate-600 font-bold uppercase py-4">No examination records localized</p>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Submission Pipeline (Latest)</h3>
                            <div className="space-y-4">
                                {studentDetail.submissions.length > 0 ? studentDetail.submissions.slice(0, 3).map((s, i) => (
                                    <div key={i} className="p-5 bg-slate-800/20 rounded-md border border-slate-700/30 flex items-center justify-between group hover:border-brand-primary/30 transition-all shadow-xl">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-brand-primary shadow-lg border border-slate-700">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white uppercase tracking-tighter mb-1">{s.assignmentId?.title}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SUBMITTED ON {new Date(s.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${s.status === 'Graded' ? 'bg-teacher-primary/10 text-teacher-primary' : 'bg-brand-primary/10 text-brand-primary'}`}>{s.status}</span>
                                            {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 shadow-xl transition-all active:scale-90"> <Info size={14} /> </a>}
                                        </div>
                                    </div>
                                )) : <p className="text-[10px] text-slate-600 font-bold uppercase py-4">No submission data available in this sector</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClassStudents;
