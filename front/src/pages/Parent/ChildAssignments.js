import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildAssignments } from '../../redux/slice/parent.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Calendar, BookOpen, Activity, Star, Download, FileText, Info } from 'lucide-react';
import Modal from '../../components/Modal';

const ChildAssignments = () => {
    const dispatch = useDispatch();
    const { selectedChild, assignments, assignmentsLoading: loading } = useSelector(state => state.parent);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildAssignments(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    const closeDetails = () => setSelectedTask(null);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-luxury-rose rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-luxury-rose">Task Registry</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Project Worksheets</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Assigned academic tasks for <span className="text-white font-bold">{selectedChild?.firstName}</span>'s sectors.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 px-8 rounded-md shadow-inner">
                    <ClipboardList size={24} className="text-luxury-rose" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Active Tasks</p>
                        <p className="text-sm font-black text-white">{assignments.length} Projects Tracked</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
                        <div className="w-10 h-10 border-2 border-luxury-rose border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Registry...</span>
                    </div>
                ) : assignments.length > 0 ? (
                    assignments.map((task, idx) => {
                        const isPastDue = new Date(task.dueDate) < new Date();
                        return (
                            <motion.div 
                                key={idx}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedTask(task)}
                                className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-6 relative group overflow-hidden cursor-pointer active:scale-95 transition-all"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                                    <BookOpen size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-md ${isPastDue ? 'bg-rose-500/10 text-rose-400' : 'bg-luxury-rose/10 text-luxury-rose'} border border-current opacity-60`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-800/80 border border-slate-700`}>
                                            {task.subject?.name || task.subject}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4 leading-tight group-hover:text-luxury-rose transition-colors">{task.title}</h3>
                                <div className="space-y-4 pt-4 border-t border-brand-border/40 text-slate-400 text-[10px] font-bold">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            <span className="uppercase tracking-widest">Deadline</span>
                                        </div>
                                        <span className={`uppercase tracking-widest ${isPastDue ? 'text-rose-400' : 'text-white'}`}>
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity size={14} className="text-slate-500" />
                                            <span className="uppercase tracking-widest">Status</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {task.status === 'Graded' ? (
                                                <>
                                                    <Star size={12} className="text-emerald-400" />
                                                    <span className="uppercase tracking-widest text-emerald-400">Graded: {task.submission?.marks}/{task.totalMarks || 100}</span>
                                                </>
                                            ) : task.status === 'Submitted' ? (
                                                <>
                                                    <CheckCircle size={12} className="text-brand-primary" />
                                                    <span className="uppercase tracking-widest text-brand-primary">Submitted</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={12} className={isPastDue ? 'text-rose-400' : 'text-amber-400'} />
                                                    <span className={`uppercase tracking-widest ${isPastDue ? 'text-rose-400' : 'text-amber-400'}`}>
                                                        {isPastDue ? 'Late' : 'Pending'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-40 bg-slate-900/10 border border-dashed border-slate-800 rounded-md flex flex-col items-center justify-center grayscale opacity-30">
                        <Activity size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sector Inactive // No Tasks Found</p>
                    </div>
                )}
            </div>

            <Modal open={!!selectedTask} onClose={closeDetails} title="Assignment Directives">
                {selectedTask && (
                    <div className="space-y-8 py-4">
                        <div className="flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-md relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                               <Info size={40} />
                           </div>
                           <div className="relative z-10">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 italic underline decoration-luxury-rose underline-offset-8 decoration-2">Academic Segment</p>
                               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedTask.title}</h2>
                               <p className="text-[9px] font-black text-luxury-rose uppercase tracking-[0.2em] mt-3 bg-luxury-rose/10 px-3 py-1.5 rounded inline-block border border-luxury-rose/20">{selectedTask.subject?.name || selectedTask.subject}</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                <FileText size={14} className="text-luxury-rose" /> Briefing & Instructions
                            </p>
                            <div className="p-6 bg-slate-900/60 border border-white/5 rounded-md">
                                <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                    {selectedTask.description || "Historical records indicate no specific instructions were attached to this directive."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-md">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Calendar size={12} /> Cycle Deadline
                                </p>
                                <p className="text-xs font-black text-white italic uppercase">{new Date(selectedTask.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-md">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <Activity size={12} /> Submission Status
                                </p>
                                <p className={`text-xs font-black italic uppercase ${selectedTask.status === 'Graded' ? 'text-emerald-400' : selectedTask.status === 'Submitted' ? 'text-brand-primary' : 'text-amber-500'}`}>
                                    {selectedTask.status}
                                </p>
                            </div>
                        </div>

                        {selectedTask.fileUrl && (
                            <div className="pt-4">
                                <a 
                                    href={selectedTask.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-luxury-rose hover:bg-rose-600 text-white rounded-md font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 italic"
                                >
                                    <Download size={18} /> Download Auxiliary Attachment
                                </a>
                            </div>
                        )}

                        <button 
                            onClick={closeDetails}
                            className="w-full py-4 border border-slate-700 hover:border-luxury-rose text-slate-500 hover:text-luxury-rose rounded-md font-black text-[10px] uppercase tracking-[0.3em] transition-all italic"
                        >
                            Return to Registry
                        </button>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
};

export default ChildAssignments;
