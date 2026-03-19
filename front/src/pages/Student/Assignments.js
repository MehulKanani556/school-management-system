import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAssignments } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { FileText, Download, Clock, User, Bookmark, ExternalLink } from 'lucide-react';

const Assignments = () => {
    const dispatch = useDispatch();
    const { assignments, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentAssignments());
    }, [dispatch]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Digital Repository</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Instructional assets & classroom tasks.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {assignments.length > 0 ? (
                    assignments.map((assignment, idx) => (
                        <motion.div 
                            key={assignment._id || idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-[3rem] shadow-2xl group hover:border-luxury-emerald/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 text-slate-800 group-hover:text-luxury-emerald/10 transition-colors">
                                <Bookmark size={40} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50">Core Directive</span>
                                    <div className={`w-2 h-2 rounded-full ${new Date(assignment.dueDate) < new Date() ? 'bg-luxury-rose' : 'bg-luxury-emerald'}`}></div>
                                </div>

                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-4 group-hover:text-luxury-emerald transition-colors">{assignment.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 italic line-clamp-3">{assignment.description || 'No detailed instructions provided for this directive.'}</p>
                                
                                <div className="mt-auto grid grid-cols-2 gap-6 pt-8 border-t border-slate-800/50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Instructor Node</p>
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <User size={14} className="text-luxury-emerald" />
                                            <span className="text-[11px] font-bold">Admin Faculty</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Deadline Sync</p>
                                        <div className="flex items-center justify-end gap-2 text-slate-300">
                                            <Clock size={14} className="text-luxury-rose" />
                                            <span className="text-[11px] font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBD'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    {assignment.fileUrl ? (
                                        <a 
                                            href={assignment.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 py-4 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        >
                                            Infiltrate File <Download size={14} />
                                        </a>
                                    ) : (
                                        <button className="flex-1 py-4 bg-slate-800 cursor-not-allowed text-slate-500 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                            No Asset <FileText size={14} />
                                        </button>
                                    )}
                                    <button className="p-4 bg-transparent border border-slate-800 hover:border-slate-600 rounded-2xl text-slate-500 transition-all">
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="lg:col-span-2 py-32 text-center bg-[#0f0f12]/40 rounded-[3rem] border border-slate-800/50 border-dashed">
                        <FileText size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">Node Empty</h3>
                        <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">No Instructional directives deployed for this sector.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Assignments;
