import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentExams } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Clock, AlertCircle, Bookmark, CheckCircle, MapPin } from 'lucide-react';

const Exams = () => {
    const dispatch = useDispatch();
    const { exams, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentExams());
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
                        exams.map((exam, idx) => (
                            <motion.div 
                                key={exam._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl group hover:border-luxury-rose/30 transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 text-slate-800 group-hover:text-luxury-rose/10 transition-colors">
                                    <Bookmark size={40} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full space-y-8">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border italic ${isUpcoming(exam.examDate) ? 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/20' : 'bg-slate-800/60 text-slate-500 border-slate-700/50'}`}>
                                            {isUpcoming(exam.examDate) ? 'Upcoming Evaluation' : 'Archive Entry'}
                                        </span>
                                        <div className={`w-2.5 h-2.5 rounded-md ${isUpcoming(exam.examDate) ? 'bg-luxury-rose shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-slate-700'}`}></div>
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase font-outfit mb-3 group-hover:text-luxury-rose transition-colors leading-none">{exam.name}</h3>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-md bg-slate-700"></div> Sub-Sector: {exam.subject?.name || 'General'}
                                        </p>
                                    </div>

                                    <div className="py-6 border-y border-slate-800/40 grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Temporal Index</p>
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <Calendar size={16} className="text-luxury-rose" />
                                                <span className="text-[12px] font-bold italic tracking-wider">{new Date(exam.examDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Sync Time</p>
                                            <div className="flex items-center gap-3 text-white">
                                                <Clock size={16} className="text-luxury-rose" />
                                                <span className="text-[12px] font-black italic tracking-wider">{exam.startTime || '09:00 AM'} - {exam.endTime || '12:00 PM'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Node Allocation</p>
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <MapPin size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{exam.roomNo || 'Main Sector Lab'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Magnitude</p>
                                            <div className="flex items-center gap-3 text-white">
                                                <div className="p-1.5 bg-luxury-rose/20 rounded border border-luxury-rose/30">
                                                    <BookOpen size={14} className="text-luxury-rose" />
                                                </div>
                                                <span className="text-sm font-black italic tracking-widest">{exam.maxMarks || 100} MARKS</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 flex items-center gap-3">
                                            <div className="h-px w-6 bg-slate-800"></div> Syllabus Directives
                                        </h4>
                                        <p className="text-slate-400 text-xs font-medium leading-relaxed italic border-l-2 border-slate-800 pl-4">{exam.description || 'Global assessment covering all sub-sector directives.'}</p>
                                    </div>

                                    <div className="mt-4">
                                        <button className="w-full py-4 bg-[#0a0a0c] border border-slate-800 hover:border-luxury-rose group-hover/btn:bg-luxury-rose transition-all rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[.25em] text-slate-500 hover:text-white shadow-2xl">
                                            Engage Study Protocol <CheckCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
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
