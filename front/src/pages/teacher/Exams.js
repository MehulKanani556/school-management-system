import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchExamSchedule } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, 
    Calendar, 
    Clock, 
    BookOpen, 
    AlertCircle, 
    Activity,
    Award,
    Hash,
    CheckCircle
} from 'lucide-react';

const TeacherExams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, loading } = useSelector(state => state.teacher);

    useEffect(() => {
        dispatch(fetchExamSchedule());
    }, [dispatch]);

    if (loading && exams.length === 0) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Synchronizing Examination Archive</p>
        </div>
    );

    return (
        <div className="space-y-12 p-2">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-luxury-rose rounded-md"></div>
                        <span className="text-[10px] font-black text-luxury-rose uppercase tracking-[0.5em] italic">Assessment Protocols</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit shadow-text-glow">Upcoming Examinations</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">Institutional evaluation schedule for assigned academic cluster sectors.</p>
                </div>

                <div className="flex items-center gap-6 bg-slate-950/80 p-6 rounded-md border border-slate-800/60 shadow-inner">
                    <div className="text-right">
                        <p className="text-sm font-black text-white uppercase italic tracking-tighter font-outfit">{exams.length}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Assessments</p>
                    </div>
                    <div className="w-10 h-10 rounded-md bg-luxury-rose/10 flex items-center justify-center text-luxury-rose border border-luxury-rose/20">
                        <Trophy size={18} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {exams.map((exam, idx) => {
                        const isEval = exam.isEvaluated;
                        return (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl shadow-2xl hover:shadow-[0_0_30px_rgba(244,63,94,0.05)] transition-all group relative overflow-hidden ${isEval ? 'hover:border-luxury-emerald/30 border-l-[3px] border-l-luxury-emerald/40' : 'hover:border-luxury-rose/30 border-l-[3px] border-l-luxury-rose/40'}`}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -mr-16 -mt-16 transition-all ${isEval ? 'bg-luxury-emerald/5 group-hover:bg-luxury-emerald/10' : 'bg-luxury-rose/5 group-hover:bg-luxury-rose/10'}`}></div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className={`w-12 h-12 rounded-md bg-slate-800 border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${isEval ? 'text-luxury-emerald border-luxury-emerald/20 bg-luxury-emerald/10' : 'text-luxury-rose border-slate-700/50'}`}>
                                        <Award size={20} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEval && <span className="text-[8px] font-black uppercase px-3 py-1 bg-luxury-emerald/10 text-luxury-emerald border border-luxury-emerald/20 tracking-widest italic rounded-md shadow-[0_0_10px_rgba(16,185,129,0.3)]">Evaluated</span>}
                                        <span className="text-[8px] font-black uppercase px-3 py-1 bg-slate-950 border border-slate-800 text-slate-500 tracking-widest italic rounded-md">ID: {exam._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight font-outfit mb-2">{exam.subject}</h3>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] italic">{exam.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 p-4 bg-slate-950/40 rounded-md border border-slate-800/60 transition-colors hover:bg-slate-900">
                                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2"> <Calendar size={10} className={isEval ? 'text-luxury-emerald/40' : 'text-luxury-rose/40'} /> Launch Date</p>
                                        <p className="text-xs font-black text-slate-300 uppercase italic font-outfit tracking-wider">{new Date(exam.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-950/40 rounded-md border border-slate-800/60 transition-colors hover:bg-slate-900">
                                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2"> <Clock size={10} className={isEval ? 'text-luxury-emerald/40' : 'text-luxury-rose/40'} /> Temporal Unit</p>
                                        <p className="text-xs font-black text-slate-300 uppercase italic font-outfit tracking-wider">{exam.startTime || '09:00 AM'} - {exam.endTime || '12:00 PM'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-white/5 flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} className="text-slate-600" />
                                            <span className={`text-xs font-black italic font-outfit tracking-tighter ${isEval ? 'text-luxury-emerald' : 'text-luxury-rose'}`}>{exam.maxMarks} <span className="text-[8px] text-slate-600 ml-1">Nodes</span></span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest italic transition-colors ${isEval ? 'text-luxury-emerald/80 group-hover:text-luxury-emerald' : 'text-slate-700 group-hover:text-luxury-rose'}`}>
                                            {isEval ? 'Completion Logged' : 'Pending Verification'} {isEval ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate(`/teacher/marks?classId=${exam.classSectionId || ''}&examId=${exam._id}`)}
                                        className={`w-full py-4 rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
                                            isEval 
                                                ? 'bg-luxury-emerald/10 border border-luxury-emerald/20 text-luxury-emerald hover:bg-luxury-emerald/20 hover:border-luxury-emerald/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-inset ring-luxury-emerald/10'
                                                : 'bg-luxury-rose/5 border border-luxury-rose/20 text-luxury-rose hover:bg-luxury-rose/10 hover:border-luxury-rose/50 hover:text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] ring-1 ring-inset ring-luxury-rose/10'
                                        }`}
                                    >
                                        {isEval ? 'Review Protocol Log' : 'Initiate Grade Upload'} <BookOpen size={14} className={isEval ? "opacity-80" : "opacity-60"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </AnimatePresence>

                {exams.length === 0 && !loading && (
                    <div className="col-span-full py-40 text-center space-y-6 opacity-30 italic">
                        <Trophy className="w-16 h-16 mx-auto mb-6 animate-pulse text-slate-800" />
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">Void Assessment Archive</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto">No upcoming evaluative directives detected in this cluster sector.</p>
                    </div>
                )}
            </div>

            <div className="bg-luxury-rose/5 border border-luxury-rose/10 p-8 rounded-md flex items-start gap-5 italic shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertCircle size={60} className="text-luxury-rose" />
                </div>
                <AlertCircle className="text-luxury-rose shrink-0" size={24} />
                <div className="space-y-2 relative z-10">
                    <p className="text-xs text-luxury-rose font-black uppercase tracking-widest">Procedural Note ST-77</p>
                    <p className="text-[12px] text-luxury-rose/80 leading-relaxed font-bold uppercase tracking-tight">
                        Examination metrics are synchronized with the institutional main-frame. Any conflict in temporal launch windows or subject protocols must be reported to the administrative oversight node immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeacherExams;
