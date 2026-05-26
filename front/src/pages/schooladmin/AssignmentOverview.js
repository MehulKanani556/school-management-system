import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentsOverview, fetchAssignmentSubmissions, deleteAssignment } from '../../redux/slice/schoolAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Calendar, Users, CheckCircle, Clock, 
    Search, Filter, ChevronRight, BarChart3, 
    FileText, User, Layout, MoreVertical, X,
    ExternalLink, Download, Award, MessageSquare, AlertCircle, Trash2
} from 'lucide-react';
import moment from 'moment';

const AssignmentOverview = () => {
    const dispatch = useDispatch();
    const { assignments, loading } = useSelector((state) => state.schoolAdmin);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Menu & Modal state
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedDetailsAssignment, setSelectedDetailsAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [error, setError] = useState(null);

    const { activeAcademicYearId } = useSelector((s) => s.academicYear);

    useEffect(() => {
        if (!activeAcademicYearId) return;
        dispatch(fetchAssignmentsOverview());
    }, [dispatch, activeAcademicYearId]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleOutsideClick = () => setActiveMenu(null);
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    const filtered = assignments.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${a.createdBy?.firstName} ${a.createdBy?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: assignments.length,
        totalSubmissions: assignments.reduce((acc, curr) => acc + curr.submissionCount, 0),
        avgSubmissionRate: assignments.length > 0 
            ? (assignments.reduce((acc, curr) => acc + (curr.submissionCount / (curr.totalPotential || 1)), 0) / assignments.length * 100).toFixed(1)
            : 0
    };

    const handleViewSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissions([]);
        setLoadingSubmissions(true);
        setError(null);
        try {
            const res = await dispatch(fetchAssignmentSubmissions(assignment._id)).unwrap();
            setSubmissions(res || []);
        } catch (err) {
            setError(err.message || 'Failed to retrieve submissions.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleDelete = async (assignmentId) => {
        if (window.confirm("Are you sure you want to decommission this active homework directive? This will also purge all student submissions associated with it.")) {
            try {
                await dispatch(deleteAssignment(assignmentId)).unwrap();
            } catch (err) {
                alert(err.message || "Failed to decommission assignment.");
            }
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit text-white">Assignment Matrix</h1>
                    <p className="text-slate-400 text-sm mt-1">Cross-institutional academic task surveillance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Filter by title, subject or teacher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-brand-border/40 rounded-md py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-brand-primary transition-all font-bold w-64 font-outfit italic"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Directives', val: stats.total, icon: BookOpen, color: 'text-schooladmin-primary', bg: 'bg-schooladmin-primary/10' },
                    { label: 'Total Submissions', val: stats.totalSubmissions, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Global Completion', val: `${stats.avgSubmissionRate}%`, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-brand-surface border border-brand-border/40 rounded-md p-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-md ${s.bg} flex items-center justify-center ${s.color} border border-white/5`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                <p className="text-2xl font-black font-outfit mt-1 text-white">{s.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && assignments.length === 0 ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-md bg-slate-800/30 animate-pulse border border-white/5" />)
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-24 text-center border border-dashed border-slate-850 rounded-md bg-slate-900/10">
                        <BookOpen size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No active directives detected in this sector</p>
                    </div>
                ) : filtered.map((a, i) => (
                    <motion.div 
                        key={a._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-brand-surface border border-brand-border/40 rounded-md p-6 hover:border-brand-primary/45 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all group relative animate-once"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 bg-schooladmin-primary/10 text-schooladmin-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-schooladmin-primary/20">
                                {a.subject}
                            </span>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold">{moment(a.dueDate).format('DD MMM')}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">{a.title}</h3>
                        
                        <div className="flex items-center gap-2 mb-6">
                            <User size={14} className="text-slate-500" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                By {a.createdBy?.firstName} {a.createdBy?.lastName}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layout size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase">
                                        {a.classSection?.standardId?.level ? `Grade ${a.classSection.standardId.level}-${a.classSection.sectionLabel}` : `Class ${a.classSection?.sectionLabel || 'N/A'}`}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black text-white">{a.submissionCount}/{a.totalPotential}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-md overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(a.submissionCount / (a.totalPotential || 1)) * 100}%` }}
                                    className={`h-full bg-gradient-to-r ${a.submissionCount === a.totalPotential ? 'from-emerald-600 to-teal-400' : 'from-schooladmin-primary to-blue-400'}`}
                                />
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                                <span className="text-emerald-500">Graded: {a.gradedCount}</span>
                                <span className="text-rose-500">Late: {a.lateCount}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-brand-border/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all relative">
                             <button 
                                 onClick={() => handleViewSubmissions(a)}
                                 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 hover:underline font-outfit italic"
                             >
                                View Submissions <ChevronRight size={12} />
                             </button>
                             <button 
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     setActiveMenu(activeMenu === a._id ? null : a._id);
                                 }}
                                 className="text-slate-500 hover:text-white transition-colors p-1"
                             >
                                <MoreVertical size={16} />
                             </button>

                             {/* Dropdown Menu */}
                             <AnimatePresence>
                                 {activeMenu === a._id && (
                                     <motion.div 
                                         initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                         animate={{ opacity: 1, scale: 1, y: 0 }}
                                         exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                         className="absolute right-0 bottom-10 z-50 w-48 bg-slate-950 border border-slate-800 rounded-md shadow-2xl p-2"
                                         onClick={(e) => e.stopPropagation()}
                                     >
                                         <button 
                                             onClick={() => {
                                                 setActiveMenu(null);
                                                 setSelectedDetailsAssignment(a);
                                             }}
                                             className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-900 rounded transition-all font-outfit italic"
                                         >
                                             Task Instructions
                                         </button>
                                         {a.fileUrl ? (
                                             <a 
                                                 href={a.fileUrl} 
                                                 target="_blank" 
                                                 rel="noreferrer"
                                                 className="block w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-brand-primary hover:text-white hover:bg-slate-900 rounded transition-all font-outfit italic"
                                                 onClick={() => setActiveMenu(null)}
                                             >
                                                 Download Asset
                                             </a>
                                         ) : (
                                             <button 
                                                 disabled
                                                 className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-600 cursor-not-allowed font-outfit italic"
                                             >
                                                 No Resource Attached
                                             </button>
                                         )}
                                         <div className="border-t border-slate-800 my-1" />
                                         <button 
                                             onClick={() => {
                                                 setActiveMenu(null);
                                                 handleDelete(a._id);
                                             }}
                                             className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 rounded transition-all font-outfit italic flex items-center gap-2"
                                         >
                                             <Trash2 size={12} /> Delete Directive
                                         </button>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Submissions Viewer Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-lg max-w-4xl w-full p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                            <button 
                                onClick={() => setSelectedAssignment(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all transform active:scale-90"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6">
                                <span className="px-3 py-1 bg-schooladmin-primary/10 text-schooladmin-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-schooladmin-primary/20">
                                    {selectedAssignment.subject}
                                </span>
                                <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter mt-3 mb-2">{selectedAssignment.title}</h2>
                                <p className="text-slate-400 text-xs italic font-medium leading-relaxed max-w-2xl">{selectedAssignment.description || 'No instruction narrative provided.'}</p>
                                <div className="flex flex-wrap items-center gap-6 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-2"><User size={12} /> By {selectedAssignment.createdBy?.firstName} {selectedAssignment.createdBy?.lastName}</span>
                                    <span className="flex items-center gap-2">
                                        <Layout size={12} /> {selectedAssignment.classSection?.standardId?.level ? `Grade ${selectedAssignment.classSection.standardId.level}-${selectedAssignment.classSection.sectionLabel}` : `Class ${selectedAssignment.classSection?.sectionLabel || 'N/A'}`}
                                    </span>
                                    <span className="flex items-center gap-2"><Calendar size={12} /> Due {moment(selectedAssignment.dueDate).format('DD MMM YYYY')}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-[300px]">
                                {loadingSubmissions ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Synchronizing academic deliverables...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <AlertCircle className="text-schooladmin-primary mb-4" size={40} />
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">{error}</p>
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <FileText className="text-slate-800 mb-4 opacity-30" size={48} />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No active submissions submitted for this directive</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800">
                                                {['Student Entity', 'Submitted Date', 'Status', 'Evaluation', 'Action'].map(h => (
                                                    <th key={h} className="py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 font-outfit italic">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-850">
                                            {submissions.map((sub) => {
                                                const student = sub.studentId;
                                                const isGraded = sub.status === 'Graded';
                                                const isLate = sub.status === 'Late';
                                                
                                                return (
                                                    <tr key={sub._id} className="hover:bg-white/[0.01] transition-colors group">
                                                        <td className="py-4 pr-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                                                                    {student?.photo ? (
                                                                        <img src={student.photo} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User size={14} className="text-slate-600" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white font-outfit text-sm italic uppercase">{student?.firstName} {student?.lastName}</p>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest"># {student?.admissionNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-xs font-bold text-slate-400 font-outfit italic">
                                                            {moment(sub.submittedAt).format('DD MMM, hh:mm A')}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border italic ${
                                                                isGraded 
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                                    : isLate 
                                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                                {sub.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            {isGraded ? (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black font-outfit">
                                                                        <Award size={12} /> {sub.marks} Score
                                                                    </div>
                                                                    {sub.feedback && (
                                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                                                            <MessageSquare size={10} /> {sub.feedback}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-600 uppercase italic">Pending Grading</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {sub.fileUrl ? (
                                                                <a 
                                                                    href={sub.fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center justify-center p-2 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all transform active:scale-95"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            ) : (
                                                                <span className="text-[9px] font-black text-slate-700 uppercase">No File</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task Details / Instructions Modal */}
            <AnimatePresence>
                {selectedDetailsAssignment && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-lg max-w-xl w-full p-8 relative shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-schooladmin-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                            <button 
                                onClick={() => setSelectedDetailsAssignment(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all transform active:scale-90"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6">
                                <span className="px-3 py-1 bg-schooladmin-primary/10 text-schooladmin-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-schooladmin-primary/20">
                                    {selectedDetailsAssignment.subject}
                                </span>
                                <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter mt-3 mb-2">{selectedDetailsAssignment.title}</h2>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><User size={12} /> By {selectedDetailsAssignment.createdBy?.firstName} {selectedDetailsAssignment.createdBy?.lastName}</span>
                                    <span className="flex items-center gap-1.5">
                                        <Layout size={12} /> {selectedDetailsAssignment.classSection?.standardId?.level ? `Grade ${selectedDetailsAssignment.classSection.standardId.level}-${selectedDetailsAssignment.classSection.sectionLabel}` : `Class ${selectedDetailsAssignment.classSection?.sectionLabel || 'N/A'}`}
                                    </span>
                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> Due {moment(selectedDetailsAssignment.dueDate).format('DD MMM YYYY')}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-outfit italic">Task Instruction Narrative</h4>
                                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-md text-slate-300 text-xs italic font-medium leading-relaxed font-outfit">
                                        {selectedDetailsAssignment.description || 'No specific instruction narrative provided for this homework task directive.'}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-outfit italic">Asset Reference</h4>
                                    {selectedDetailsAssignment.fileUrl ? (
                                        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-md">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <FileText size={18} className="text-brand-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Assignment File Uploaded</span>
                                            </div>
                                            <a 
                                                href={selectedDetailsAssignment.fileUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all transform active:scale-95 font-outfit italic shadow-md"
                                            >
                                                <Download size={12} /> Download Asset
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-850 rounded-md text-slate-500">
                                            <AlertCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">No auxiliary files attached to this directive node.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-brand-border/20 flex justify-end">
                                <button 
                                    onClick={() => setSelectedDetailsAssignment(null)}
                                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded bg-slate-800 hover:bg-slate-700 text-white font-outfit italic transition-all transform active:scale-95"
                                >
                                    Dismiss Panel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssignmentOverview;
