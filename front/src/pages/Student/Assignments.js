import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAssignments, submitAssignment, fetchMySubmissions } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Clock, User, Bookmark, ExternalLink, Send, Upload, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Assignments = () => {
    const dispatch = useDispatch();
    const { assignments, submissions, loading } = useSelector((state) => state.student);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionData, setSubmissionData] = useState({ file: null, comment: '' });

    useEffect(() => {
        dispatch(fetchStudentAssignments());
        dispatch(fetchMySubmissions());
    }, [dispatch]);

    const handleFileChange = (e) => {
        setSubmissionData({ ...submissionData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionData.file || !selectedAssignment) return;

        const formData = new FormData();
        formData.append('assignmentId', selectedAssignment._id);
        formData.append('file', submissionData.file);
        formData.append('comment', submissionData.comment);

        dispatch(submitAssignment(formData)).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                toast.success('Objective Synchronized: Submission Deployed.');
                setSelectedAssignment(null);
                setSubmissionData({ file: null, comment: '' });
                dispatch(fetchMySubmissions());
            } else {
                toast.error(res.payload || 'Transmission Failure.');
            }
        });
    };

    const getSubmissionStatus = (assignmentId) => {
        const sub = submissions.find(s => (s.assignmentId?._id || s.assignmentId) === assignmentId);
        if (!sub) return null;
        return sub;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Digital Repository</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Instructional assets & classroom tasks.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {assignments.length > 0 ? (
                    assignments.map((assignment, idx) => {
                        const sub = getSubmissionStatus(assignment._id);
                        return (
                            <motion.div 
                                key={assignment._id || idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-[#0f0f12] border p-10 rounded-md shadow-2xl group hover:border-luxury-emerald/30 transition-all relative overflow-hidden ${sub ? 'border-luxury-emerald/20' : 'border-slate-800/60'}`}
                            >
                                <div className="absolute top-0 right-0 p-8 text-slate-800 group-hover:text-luxury-emerald/10 transition-colors">
                                    <Bookmark size={40} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        {sub ? (
                                            <span className="px-3 py-1 bg-luxury-emerald/10 rounded-md text-[9px] font-black uppercase tracking-widest text-luxury-emerald border border-luxury-emerald/20 flex items-center gap-2">
                                                <CheckCircle size={10} /> Deployed {sub.marksObtained ? `[Graded: ${sub.marksObtained}]` : ''}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50">Core Directive</span>
                                        )}
                                        <div className={`w-2 h-2 rounded-md ${new Date(assignment.dueDate) < new Date() && !sub ? 'bg-luxury-rose' : 'bg-luxury-emerald'}`}></div>
                                    </div>

                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-4 group-hover:text-luxury-emerald transition-colors">{assignment.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 italic line-clamp-3">{assignment.description || 'No detailed instructions provided for this directive.'}</p>
                                    
                                    <div className="mt-auto grid grid-cols-2 gap-6 pt-8 border-t border-slate-800/50">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Instructor Node</p>
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <User size={14} className="text-luxury-emerald" />
                                                <span className="text-[11px] font-bold">Faculty Admin</span>
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
                                        {assignment.fileUrl && (
                                            <a 
                                                href={assignment.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/30"
                                            >
                                                Source Asset <Download size={14} />
                                            </a>
                                        )}
                                        
                                        {!sub ? (
                                            <button 
                                                onClick={() => setSelectedAssignment(assignment)}
                                                className="flex-[2] py-4 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                            >
                                                Deploy Submission <Send size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex-[2] py-4 bg-slate-900 border border-luxury-emerald/30 text-luxury-emerald rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                                Synched Successfully <CheckCircle size={14} />
                                            </div>
                                        )}
                                    </div>

                                    {sub && sub.feedback && (
                                        <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-md">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">Teacher Feedback</p>
                                            <p className="text-slate-400 text-[11px] italic font-medium">"{sub.feedback}"</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="lg:col-span-2 py-32 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed">
                        <FileText size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">Node Empty</h3>
                        <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">No Instructional directives deployed for this sector.</p>
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0a0c]/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f0f12] border border-slate-800 w-full max-w-xl p-10 rounded-md shadow-3xl relative overflow-hidden"
                        >
                             <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setSelectedAssignment(null)} className="text-slate-600 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <header className="space-y-2">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-outfit leading-none">Initialize Deployment</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-none">Target: {selectedAssignment.title}</p>
                                </header>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 italic">Submission Asset</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                required
                                                onChange={handleFileChange}
                                                className="hidden" 
                                                id="subFile" 
                                            />
                                            <label 
                                                htmlFor="subFile"
                                                className="w-full h-32 bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-md flex flex-col items-center justify-center gap-4 cursor-pointer group-hover:border-luxury-emerald/50 transition-all group-hover:bg-luxury-emerald/5"
                                            >
                                                <Upload className={`transition-colors ${submissionData.file ? 'text-luxury-emerald' : 'text-slate-700'}`} size={32} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400">
                                                    {submissionData.file ? submissionData.file.name : 'Click to select binary archive'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 italic">Direct Comments</label>
                                        <textarea 
                                            placeholder="ENTER OPTIONAL TRANSMISSION METADATA..."
                                            value={submissionData.comment}
                                            onChange={(e) => setSubmissionData({...submissionData, comment: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-6 text-sm font-bold text-white italic outline-none focus:border-luxury-emerald placeholder:text-slate-900 resize-none h-32 uppercase tracking-tighter transition-all"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={!submissionData.file}
                                        className="w-full py-5 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-4 text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed group"
                                    >
                                        Deploy Payload <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Assignments;
