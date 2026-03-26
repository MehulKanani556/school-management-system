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
            className="space-y-8 max-w-7xl mx-auto"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Evaluation Matrix</h1>
                    <p className="text-slate-500 font-medium text-lg italic">Sector-wide academic assessment protocols & scheduling.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                    className={`relative bg-[#0a0a0c]/80 backdrop-blur-2xl border ${isEval ? 'border-luxury-emerald/30 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'border-slate-800 hover:border-luxury-rose/50 hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]'} p-8 rounded-[2rem] group transition-all duration-500 overflow-hidden`}
                                >
                                    {/* Animated Background Glow */}
                                    <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-700 ${isEval ? 'bg-luxury-emerald/10 group-hover:bg-luxury-emerald/20' : 'bg-luxury-rose/5 group-hover:bg-luxury-rose/15'}`}></div>
                                    
                                    {/* Watermark Icon */}
                                    <div className={`absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-110 -rotate-12 ${isEval ? 'text-luxury-emerald' : 'text-white'}`}>
                                        <BookOpen size={220} strokeWidth={1} />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Status Header */}
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${isEval ? 'bg-luxury-emerald animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]' : (isUpcoming(exam.date) ? 'bg-luxury-rose shadow-[0_0_15px_rgba(244,63,94,0.6)] bg-opacity-80' : 'bg-slate-700')}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.25em] italic ${isEval ? 'text-luxury-emerald' : (isUpcoming(exam.date) ? 'text-luxury-rose' : 'text-slate-500')}`}>
                                                    {isEval ? 'Evaluated Node' : (isUpcoming(exam.date) ? 'Upcoming Protocol' : 'Archive Entry')}
                                                </span>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isEval ? 'border-luxury-emerald/30 bg-luxury-emerald/10 text-luxury-emerald' : 'border-slate-800 bg-slate-900/50 text-slate-400'} italic`}>
                                                {exam.type?.replace('_', ' ') || 'Terminal Exam'}
                                            </div>
                                        </div>

                                        {/* Exam Title & Subject */}
                                        <div className="mb-10">
                                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase font-outfit mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
                                                {exam.name}
                                            </h3>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] flex items-center gap-3 italic">
                                                <Bookmark size={15} className={isEval ? 'text-luxury-emerald' : 'text-luxury-rose'} /> {exam.subject?.name || 'General Core'}
                                            </p>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-10">
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400">Temporal Index</p>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <Calendar size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-luxury-rose/70'} />
                                                    <span className="text-sm font-bold tracking-widest">{new Date(exam.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400">Sync Time</p>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <Clock size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-luxury-rose/70'} />
                                                    <span className="text-sm font-bold tracking-widest uppercase">{exam.startTime || '09:00 AM'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400">Node Allocation</p>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <MapPin size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-slate-600'} />
                                                    <span className="text-xs font-black uppercase tracking-[0.2em]">{exam.roomNo || 'Main Lab'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 hover:bg-slate-900/80 transition-colors group/metric">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 italic group-hover/metric:text-slate-400">Magnitude</p>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <AlertCircle size={16} className={isEval ? 'text-luxury-emerald/70' : 'text-slate-600'} />
                                                    <span className="text-sm font-black italic tracking-widest">{exam.maxMarks || 100} <span className="text-[10px] text-slate-500">PTS</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action / Result Area */}
                                        <div className="mt-auto pt-6 border-t border-slate-800/50">
                                            {isEval ? (
                                                <div className="w-full py-5 bg-luxury-emerald/10 border border-luxury-emerald/20 hover:border-luxury-emerald/40 transition-colors rounded-2xl flex items-center justify-between px-8 shadow-[0_0_30px_rgba(16,185,129,0.08)] group/result">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-luxury-emerald/20 rounded-xl group-hover/result:scale-110 transition-transform duration-300">
                                                            <Award size={18} className="text-luxury-emerald" />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-luxury-emerald italic">Final Rating</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-white italic font-outfit tracking-tighter">
                                                        {result.marksObtained} <span className="text-slate-500 text-sm font-bold tracking-widest">/ {exam.maxMarks || 100}</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => navigate('/student/e-learning')}
                                                    className="w-full py-6 bg-slate-950 hover:bg-luxury-rose border border-slate-800 hover:border-luxury-rose text-slate-400 hover:text-white transition-all duration-500 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] group/btn hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]">
                                                    Engage Study Protocol 
                                                    <CheckCircle size={18} className="opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-300" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="lg:col-span-2 py-40 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed">
                            <BookOpen size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">Matrix Depeleted</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">No active assessment protocols programmed for this terminal.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Exams;
