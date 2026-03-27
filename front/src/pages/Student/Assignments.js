import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAssignments, submitAssignment, fetchMySubmissions } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Clock, User, Bookmark, ExternalLink, Send, Upload, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Assignments = () => {
    const dispatch = useDispatch();
    const { assignments, submissions, loading } = useSelector((state) => state.student);
    const [activeTab, setActiveTab] = useState('directives');
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
                toast.success('Assignment Submitted Successfully.');
                setSelectedAssignment(null);
                setSubmissionData({ file: null, comment: '' });
                dispatch(fetchMySubmissions());
            } else {
                toast.error(res.payload || 'Submission Failed. Please try again.');
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
            className="space-y-8 font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-outfit">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">Assignments & Tasks</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Access your coursework, homework, and submission portal.</p>
                </div>
                
                <div className="flex bg-slate-900/40 p-1.5 rounded-md border border-slate-800/60 font-outfit">
                    <button 
                        onClick={() => setActiveTab('directives')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directives' ? 'bg-luxury-emerald text-black shadow-lg shadow-luxury-emerald/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Pending Assignments
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-luxury-emerald text-black shadow-lg shadow-luxury-emerald/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Submission History
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-outfit">
                {activeTab === 'directives' ? (
                    assignments.length > 0 ? (
                        assignments.map((assignment, idx) => {
                            const sub = getSubmissionStatus(assignment._id);
                            return (
                                <motion.div 
                                    key={assignment._id || idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`bg-[#0f0f12] border p-10 rounded-md shadow-2xl group hover:border-luxury-emerald/30 transition-all relative overflow-hidden font-outfit ${sub ? 'border-luxury-emerald/20' : 'border-slate-800/60'}`}
                                >
                                    <div className="absolute top-0 right-0 p-8 text-slate-800 group-hover:text-luxury-emerald/10 transition-colors">
                                        <Bookmark size={40} />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-6">
                                            {sub ? (
                                                <span className="px-3 py-1 bg-luxury-emerald/10 rounded-md text-[9px] font-black uppercase tracking-widest text-luxury-emerald border border-luxury-emerald/20 flex items-center gap-2 italic">
                                                    <CheckCircle size={10} /> Submitted {sub.status}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50 italic">Mandatory Assignment</span>
                                            )}
                                            <div className={`w-2 h-2 rounded-md ${new Date(assignment.dueDate) < new Date() && !sub ? 'bg-luxury-rose' : 'bg-luxury-emerald'}`}></div>
                                        </div>

                                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase font-outfit mb-4 group-hover:text-luxury-emerald transition-colors">{assignment.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 italic line-clamp-3">{assignment.description || 'No detailed instructions provided for this assignment.'}</p>
                                        
                                        <div className="mt-auto grid grid-cols-2 gap-6 pt-8 border-t border-slate-800/50 font-outfit">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Teacher</p>
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <User size={14} className="text-luxury-emerald" />
                                                    <span className="text-[11px] font-bold">Class Teacher</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Submission Due</p>
                                                <div className="flex items-center justify-end gap-2 text-slate-300">
                                                    <Clock size={14} className="text-luxury-rose" />
                                                    <span className="text-[11px] font-bold">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex gap-4 font-outfit">
                                            {assignment.fileUrl && (
                                                <a 
                                                    href={assignment.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/30 font-outfit h-[42px]"
                                                >
                                                    Download File <Download size={14} />
                                                </a>
                                            )}
                                            
                                            {!sub ? (
                                                <button 
                                                    onClick={() => setSelectedAssignment(assignment)}
                                                    className="flex-[2] py-4 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] h-[42px]"
                                                >
                                                    Submit Now <Send size={14} />
                                                </button>
                                            ) : (
                                                <div className="flex-[2] py-4 bg-slate-900 border border-luxury-emerald/30 text-luxury-emerald rounded-md flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] h-[42px]">
                                                    Submitted Successfully <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="lg:col-span-2 py-32 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed font-outfit">
                            <FileText size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2 italic">No Assignments</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest italic">No pending assignments have been assigned at this time.</p>
                        </div>
                    )
                ) : (
                    submissions.length > 0 ? (
                        submissions.map((sub, idx) => (
                            <motion.div 
                                key={sub._id || idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl relative overflow-hidden group font-outfit"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all font-outfit">
                                    <Clock size={64} />
                                </div>
                                
                                <div className="relative z-10 font-outfit">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-3 py-1 bg-brand-primary/10 rounded-md text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/20 italic">Completed Submission</span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase font-outfit mb-2">{sub.assignmentId?.title || 'Unknown Assignment'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 italic">{sub.assignmentId?.subject || 'General Subject'}</p>

                                    <div className="space-y-4 font-outfit">
                                        <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-md border border-slate-800/40 font-outfit">
                                            <div className="p-2 bg-slate-800 rounded-md"><FileText size={16} className="text-slate-400" /></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Submitted File</p>
                                                <p className="text-[11px] font-bold text-slate-300 truncate">{sub.fileUrl?.split('/').pop()}</p>
                                            </div>
                                            <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-all">
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>

                                        {sub.feedback && (
                                            <div className="p-5 bg-luxury-emerald/5 border border-luxury-emerald/20 rounded-md font-outfit">
                                                <p className="text-[9px] font-black text-luxury-emerald uppercase tracking-widest mb-2 italic">Teacher Feedback</p>
                                                <p className="text-slate-400 text-xs italic font-medium leading-relaxed">"{sub.feedback}"</p>
                                                {sub.marksObtained && (
                                                    <div className="mt-4 pt-4 border-t border-luxury-emerald/10 flex justify-between items-center font-outfit">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Marks Obtained</span>
                                                        <span className="text-lg font-black text-white italic font-outfit">{sub.marksObtained} Marks</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="lg:col-span-2 py-32 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed font-outfit">
                            <Clock size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2 italic">No History</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest italic">No previous assignments have been submitted yet.</p>
                        </div>
                    )
                )}
            </div>

            {/* Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a0a0c]/80 backdrop-blur-md font-outfit">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f0f12] border border-slate-800 w-full max-w-xl p-10 rounded-md shadow-3xl relative overflow-hidden font-outfit"
                        >
                             <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setSelectedAssignment(null)} className="text-slate-600 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="relative z-10 space-y-8 font-outfit">
                                <header className="space-y-2 font-outfit">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-outfit leading-none">Submit Assignment</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-none">Assignment: {selectedAssignment.title}</p>
                                </header>

                                <form onSubmit={handleSubmit} className="space-y-8 font-outfit">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 italic leading-none">Upload File</label>
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
                                                    {submissionData.file ? submissionData.file.name : 'Click to select file'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 italic leading-none">Additional Comments</label>
                                        <textarea 
                                            placeholder="ENTER OPTIONAL COMMENTS..."
                                            value={submissionData.comment}
                                            onChange={(e) => setSubmissionData({...submissionData, comment: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-6 text-sm font-bold text-white italic outline-none focus:border-luxury-emerald placeholder:text-slate-900 resize-none h-32 uppercase tracking-tighter transition-all"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={!submissionData.file}
                                        className="w-full py-5 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md flex items-center justify-center gap-4 text-[12px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed group h-[52px]"
                                    >
                                        Submit Assignment <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
