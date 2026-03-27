import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudentExams, fetchStudentResults } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Clock, AlertCircle, Bookmark, CheckCircle, MapPin, Award } from 'lucide-react';

const Exams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, results, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentExams());
        dispatch(fetchStudentResults());
    }, [dispatch]);

    const isUpcoming = (date) => new Date(date) > new Date();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden font-outfit">
                <div className="space-y-2 font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Exams & Assessments</h1>
                    <p className="text-slate-500 font-medium text-lg italic">View your upcoming exams, schedules, and past results.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-outfit">
                <AnimatePresence>
                    {exams.length > 0 ? (
                        exams.map((exam, idx) => {
                            const result = results?.find(r => r.examId?._id === exam._id);
                            const isEval = !!result;

                            return (
                                <motion.div 
                                    key={exam._id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                                    className={`relative bg-[#0a0a0c]/80 backdrop-blur-2xl border ${isEval ? 'border-luxury-emerald/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'border-slate-800 hover:border-luxury-rose/50 hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]'} p-8 rounded-[2rem] group transition-all duration-500 overflow-hidden font-outfit`}
                                >
                                    {/* Animated Background Glow */}
                                    <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-700 ${isEval ? 'bg-luxury-emerald/10 group-hover:bg-luxury-emerald/20' : 'bg-luxury-rose/5 group-hover:bg-luxury-rose/15'}`}></div>
                                    
                                    {/* Watermark Icon */}
                                    <div className={`absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 -rotate-12 ${isEval ? 'text-luxury-emerald' : 'text-white'}`}>
                                        <BookOpen size={220} strokeWidth={1} />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full font-outfit">
                                        {/* Status Header */}
                                        <div className="flex items-center justify-between mb-8 font-outfit">
                                            <div className="flex items-center gap-3 font-outfit">
                                                <div className={`w-2.5 h-2.5 rounded-full ${isEval ? 'bg-luxury-emerald animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]' : (isUpcoming(exam.date) ? 'bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'bg-slate-700 font-outfit')}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.25em] italic ${isEval ? 'text-luxury-emerald' : (isUpcoming(exam.date) ? 'text-brand-primary' : 'text-slate-500')}`}>
                                                    {isEval ? 'Result Declared' : (isUpcoming(exam.date) ? 'Upcoming Exam' : 'Past Exam')}
                                                </span>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isEval ? 'border-luxury-emerald/30 bg-luxury-emerald/10 text-luxury-emerald' : 'border-slate-800 bg-slate-900/50 text-slate-400 font-outfit'} italic font-outfit`}>
                                                {exam.type?.replace('_', ' ') || 'Semester Exam'}
                                            </div>
                                        </div>

                                        {/* Exam Title & Subject */}
                                        <div className="mb-10 font-outfit">
                                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase font-outfit mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
                                                {exam.name}
                                            </h3>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] flex items-center gap-3 italic font-outfit">
                                                <Bookmark size={15} className={isEval ? 'text-luxury-emerald' : 'text-brand-primary'} /> {exam.subject?.name || 'General Subject'}
                                            </p>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-10 font-outfit">
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric font-outfit">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400 font-outfit">Exam Date</p>
                                                <div className="flex items-center gap-3 text-slate-300 font-outfit">
                                                    <Calendar size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-brand-primary/70'} />
                                                    <span className="text-sm font-bold tracking-widest font-outfit">{new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric font-outfit">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400 font-outfit">Start Time</p>
                                                <div className="flex items-center gap-3 text-slate-300 font-outfit">
                                                    <Clock size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-brand-primary/70'} />
                                                    <span className="text-sm font-bold tracking-widest uppercase font-outfit">{exam.startTime || '09:00 AM'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric font-outfit">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400 font-outfit">Room No.</p>
                                                <div className="flex items-center gap-3 text-slate-300 font-outfit">
                                                    <MapPin size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-slate-600 font-outfit'} />
                                                    <span className="text-xs font-black uppercase tracking-[0.2em] font-outfit">{exam.roomNo || 'Examination Hall'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric font-outfit">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400 font-outfit">Max Marks</p>
                                                <div className="flex items-center gap-3 text-slate-300 font-outfit">
                                                    <AlertCircle size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-slate-600 font-outfit'} />
                                                    <span className="text-sm font-black italic tracking-widest font-outfit">{exam.maxMarks || 100} <span className="text-[10px] text-slate-500 font-outfit">MARKS</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action / Result Area */}
                                        <div className="mt-auto pt-6 border-t border-slate-800/50 font-outfit">
                                            {isEval ? (
                                                <div className="w-full py-5 bg-luxury-emerald/10 border border-luxury-emerald/20 hover:border-luxury-emerald/40 transition-colors rounded-2xl flex items-center justify-between px-8 shadow-[0_0_30px_rgba(16,185,129,0.08)] group/result font-outfit">
                                                    <div className="flex items-center gap-4 font-outfit">
                                                        <div className="p-2.5 bg-luxury-emerald/20 rounded-xl group-hover/result:scale-110 transition-transform duration-300 font-outfit border border-emerald-500/20">
                                                            <Award size={18} className="text-luxury-emerald font-outfit" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-luxury-emerald italic font-outfit">Marks Obtained</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-white italic font-outfit tracking-tighter">
                                                        {result.marksObtained} <span className="text-slate-500 text-sm font-bold tracking-widest font-outfit">/ {exam.maxMarks || 100}</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => navigate('/student/e-learning')}
                                                    className="w-full py-6 bg-slate-950 hover:bg-brand-primary border border-slate-800 hover:border-brand-primary text-slate-400 hover:text-white transition-all duration-500 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] group/btn hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] italic">
                                                    Preparation Materials 
                                                    <CheckCircle size={18} className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300 font-outfit" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="lg:col-span-2 py-40 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed font-outfit">
                            <BookOpen size={64} className="text-slate-800 mx-auto mb-8 opacity-20 font-outfit" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">No Exams Found</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest italic font-outfit">Keep checking for new exam announcements.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Exams;
