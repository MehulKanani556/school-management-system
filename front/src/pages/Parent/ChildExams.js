import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildExams } from '../../redux/slice/parent.slice';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Clock, MapPin, AlertCircle } from 'lucide-react';

const ChildExams = () => {
    const dispatch = useDispatch();
    const { selectedChild, exams, loading } = useSelector(state => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildExams(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    if (!selectedChild) return (
        <div className="flex items-center justify-center h-64 text-slate-500 italic">
            Select a child to view examination schedule
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Exam Schedule</h1>
                    <p className="text-slate-500 text-sm italic">Showing published examinations for {selectedChild.firstName}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-md">
                    <AlertCircle size={16} className="text-brand-primary" />
                    <span className="text-xs font-bold text-brand-primary uppercase">Official Schedule</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-800/20 rounded-xl" />)}
                </div>
            ) : exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-800/20 border border-slate-700/50 rounded-xl border-dashed">
                    <Calendar size={48} className="text-slate-600 mb-4" />
                    <p className="text-slate-500 font-medium">No upcoming examinations published yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam, i) => (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-brand-surface/40 hover:bg-brand-surface/60 border border-brand-border/40 hover:border-brand-primary/40 rounded-xl p-6 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <BookOpen size={24} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/80 px-2 py-1 rounded">
                                    {exam.subject?.name || 'Subject'}
                                </div>
                            </div>

                            <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white mb-4 group-hover:text-brand-primary transition-colors">
                                {exam.title}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Calendar size={14} className="text-brand-primary" />
                                    <span className="text-xs font-medium">
                                        {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Clock size={14} className="text-brand-primary" />
                                    <span className="text-xs font-medium">{exam.startTime} - {exam.endTime}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <MapPin size={14} className="text-brand-primary" />
                                    <span className="text-xs font-medium">{exam.roomNumber || 'Assigned Hall'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Max Marks</span>
                                <span className="text-sm font-bold text-white">{exam.totalMarks || 100}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChildExams;
