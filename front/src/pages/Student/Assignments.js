import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentAssignments, submitAssignment, fetchMySubmissions } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Download, Clock, User, Bookmark, ExternalLink, Send, 
    Upload, X, CheckCircle, Search, Filter, ArrowUpDown, AlertCircle, 
    CheckSquare, Calendar, HelpCircle, Star, BookOpen, Atom, Globe, 
    Music, Palette, Calculator, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const Assignments = () => {
    const dispatch = useDispatch();
    const { assignments, submissions, loading } = useSelector((state) => state.student);
    const [activeTab, setActiveTab] = useState('directives');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionData, setSubmissionData] = useState({ file: null, comment: '' });
    
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [sortBy, setSortBy] = useState('CREATED_DESC');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        dispatch(fetchStudentAssignments());
        dispatch(fetchMySubmissions());
    }, [dispatch]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSubmissionData({ ...submissionData, file: e.target.files[0] });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSubmissionData({ ...submissionData, file: e.dataTransfer.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionData.file || !selectedAssignment) return;

        const formData = new FormData();
        formData.append('assignmentId', selectedAssignment._id);
        formData.append('file', submissionData.file);
        formData.append('comments', submissionData.comment);

        dispatch(submitAssignment(formData)).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                setSelectedAssignment(null);
                setSubmissionData({ file: null, comment: '' });
                dispatch(fetchMySubmissions());
            }
        });
    };

    const getSubmissionStatus = (assignmentId) => {
        const sub = submissions.find(s => (s.assignmentId?._id || s.assignmentId) === assignmentId);
        return sub || null;
    };

    // Extract dynamic subjects from assignments
    const subjects = useMemo(() => {
        const subs = new Set();
        assignments.forEach(a => {
            if (a.subject) subs.add(a.subject);
        });
        return ['ALL', ...Array.from(subs)];
    }, [assignments]);

    // Compute metrics
    const stats = useMemo(() => {
        let pending = 0;
        let overdue = 0;
        let completed = 0;

        assignments.forEach(a => {
            const sub = getSubmissionStatus(a._id);
            if (sub) {
                completed++;
            } else if (new Date(a.dueDate) < new Date()) {
                overdue++;
            } else {
                pending++;
            }
        });

        return { pending, overdue, completed, total: assignments.length };
    }, [assignments, submissions]);

    // Helpers for visual aesthetics
    const getInitials = (name) => {
        if (!name) return 'TC';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (initials) => {
        const colors = [
            'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'bg-violet-500/10 text-violet-400 border-violet-500/20',
            'bg-sky-500/10 text-sky-400 border-sky-500/20',
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
        ];
        const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
        return colors[code % colors.length];
    };

    const getSubjectColor = (subject) => {
        const sub = (subject || '').toLowerCase();
        if (sub.includes('math') || sub.includes('calc') || sub.includes('alg') || sub.includes('geom')) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        if (sub.includes('sci') || sub.includes('phys') || sub.includes('chem') || sub.includes('bio')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (sub.includes('hist') || sub.includes('civ') || sub.includes('soc')) return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
        if (sub.includes('geog') || sub.includes('env')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (sub.includes('eng') || sub.includes('lang') || sub.includes('lit') || sub.includes('read') || sub.includes('write')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        if (sub.includes('art') || sub.includes('draw') || sub.includes('mus') || sub.includes('sing')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
    };

    const getSubjectIcon = (subject) => {
        const sub = (subject || '').toLowerCase();
        if (sub.includes('math') || sub.includes('calc') || sub.includes('alg') || sub.includes('geom')) {
            return <Calculator size={14} />;
        }
        if (sub.includes('sci') || sub.includes('phys') || sub.includes('chem') || sub.includes('bio')) {
            return <Atom size={14} />;
        }
        if (sub.includes('hist') || sub.includes('civ') || sub.includes('soc')) {
            return <Layers size={14} />;
        }
        if (sub.includes('geog') || sub.includes('env')) {
            return <Globe size={14} />;
        }
        if (sub.includes('eng') || sub.includes('lang') || sub.includes('lit') || sub.includes('read') || sub.includes('write')) {
            return <BookOpen size={14} />;
        }
        if (sub.includes('art') || sub.includes('draw')) {
            return <Palette size={14} />;
        }
        if (sub.includes('mus') || sub.includes('sing')) {
            return <Music size={14} />;
        }
        return <FileText size={14} />;
    };

    const getDueDateInfo = (dueDateStr) => {
        const now = new Date();
        const dueDate = new Date(dueDateStr);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Overdue', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' };
        }
        if (diffDays === 0) {
            return { label: 'Due Today', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        }
        if (diffDays === 1) {
            return { label: 'Due Tomorrow', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        }
        if (diffDays <= 3) {
            return { label: `${diffDays} Days Left`, style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
        }
        return { label: `${diffDays} Days Left`, style: 'bg-slate-800/80 text-slate-400 border-slate-700/50' };
    };

    // Filter and Sort Assignments
    const filteredAssignments = useMemo(() => {
        let list = [...assignments];

        // Search text
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(a => 
                a.title?.toLowerCase().includes(query) || 
                a.description?.toLowerCase().includes(query)
            );
        }

        // Subject filter
        if (selectedSubject !== 'ALL') {
            list = list.filter(a => a.subject === selectedSubject);
        }

        // Sorting
        list.sort((a, b) => {
            if (sortBy === 'CREATED_DESC') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'CREATED_ASC') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'DUE_DATE_ASC') return new Date(a.dueDate) - new Date(b.dueDate);
            if (sortBy === 'DUE_DATE_DESC') return new Date(b.dueDate) - new Date(a.dueDate);
            if (sortBy === 'TITLE_ASC') return a.title?.localeCompare(b.title);
            if (sortBy === 'TITLE_DESC') return b.title?.localeCompare(a.title);
            return 0;
        });

        return list;
    }, [assignments, searchQuery, selectedSubject, sortBy]);

    // Filter Submission History
    const filteredSubmissions = useMemo(() => {
        let list = [...submissions];

        // Search text
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(s => 
                s.assignmentId?.title?.toLowerCase().includes(query) ||
                s.assignmentId?.subject?.toLowerCase().includes(query) ||
                s.comments?.toLowerCase().includes(query) ||
                s.feedback?.toLowerCase().includes(query)
            );
        }

        // Subject filter
        if (selectedSubject !== 'ALL') {
            list = list.filter(s => s.assignmentId?.subject === selectedSubject);
        }

        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        return list;
    }, [submissions, searchQuery, selectedSubject]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 font-outfit text-left w-full pb-16"
        >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900/60 pb-6 w-full text-left">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 flex items-center gap-3">
                        Assignments & Tasks
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
                    </h1>
                    <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-xl italic uppercase tracking-wider">
                        Access Your Coursework, Homework, And Academic Submission Portal.
                    </p>
                </div>
                
                {/* Active Tab Panel */}
                <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
                    <button 
                        onClick={() => setActiveTab('directives')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'directives' ? 'bg-luxury-emerald text-black shadow-lg shadow-luxury-emerald/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Pending Assignments
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'history' ? 'bg-luxury-emerald text-black shadow-lg shadow-luxury-emerald/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Submission History
                    </button>
                </div>
            </header>

            {/* Glowing Horizontal Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                
                {/* Completed Metric Card */}
                <div className="bg-gradient-to-br from-violet-650/15 to-indigo-950/20 backdrop-blur-xl border border-violet-500/20 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:shadow-violet-500/5 hover:border-violet-500/40 transition-all duration-500 group">
                    <div className="text-left space-y-1.5">
                        <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest leading-none">Completed Work</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{stats.completed}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{stats.completed} of {stats.total} Assignments</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-violet-550/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <CheckSquare size={20} />
                    </div>
                </div>

                {/* Pending Metric Card */}
                <div className="bg-gradient-to-br from-emerald-650/15 to-teal-950/20 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:shadow-emerald-500/5 hover:border-emerald-500/40 transition-all duration-500 group">
                    <div className="text-left space-y-1.5">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Pending Tasks</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{stats.pending}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Awaiting Deliverables</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-550/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Clock size={20} />
                    </div>
                </div>

                {/* Overdue Metric Card */}
                <div className="bg-gradient-to-br from-rose-650/15 to-red-950/20 backdrop-blur-xl border border-rose-500/20 p-5 rounded-2xl shadow-xl flex items-center justify-between hover:shadow-rose-500/5 hover:border-rose-500/40 transition-all duration-500 group">
                    <div className="text-left space-y-1.5">
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Overdue Alerts</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{stats.overdue}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{stats.overdue > 0 ? 'Requires Immediate Action' : 'No Overdue Tasks'}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-rose-550/10 border border-rose-500/20 flex items-center justify-center text-rose-450 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${stats.overdue > 0 ? 'animate-pulse' : ''}`}>
                        <AlertCircle size={20} />
                    </div>
                </div>

            </div>

            {/* Unified Horizontal Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/35 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl w-full">
                
                {/* Search query box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="SEARCH WORK BY KEYWORD..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-brand-primary/60 outline-none transition-all"
                    />
                </div>

                {/* Filters right side box */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    
                    {/* Subject filter */}
                    <div className="relative flex-1 sm:flex-initial">
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full sm:w-48 bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-350 focus:border-brand-primary/60 outline-none transition-all cursor-pointer appearance-none"
                        >
                            {subjects.map(sub => (
                                <option key={sub} value={sub}>{sub === 'ALL' ? 'ALL SUBJECTS' : sub}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sorting sorting controls */}
                    {activeTab === 'directives' && (
                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-56 bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-350 focus:border-brand-primary/60 outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="CREATED_DESC">NEWEST ASSIGNED FIRST</option>
                                <option value="CREATED_ASC">OLDEST ASSIGNED FIRST</option>
                                <option value="DUE_DATE_ASC">SOONEST DUE FIRST</option>
                                <option value="DUE_DATE_DESC">LATEST DUE FIRST</option>
                                <option value="TITLE_ASC">ALPHABETICAL: A-Z</option>
                                <option value="TITLE_DESC">ALPHABETICAL: Z-A</option>
                            </select>
                        </div>
                    )}

                </div>
            </div>

            {/* Assignments list grid */}
            <div className="w-full">
                {activeTab === 'directives' ? (
                    filteredAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
                            {filteredAssignments.map((assignment, idx) => {
                                const sub = getSubmissionStatus(assignment._id);
                                const teacherName = assignment.createdBy ? `${assignment.createdBy.firstName} ${assignment.createdBy.lastName}` : 'Class Teacher';
                                const initials = getInitials(teacherName);
                                const avatarColor = getAvatarColor(initials);
                                const subColorClass = getSubjectColor(assignment.subject);
                                const dueInfo = getDueDateInfo(assignment.dueDate);
                                
                                return (
                                    <motion.div 
                                        key={assignment._id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`bg-gradient-to-b from-slate-900/50 to-slate-950/40 backdrop-blur-2xl border p-6 rounded-2xl shadow-2xl hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(88,166,255,0.08)] transition-all duration-500 relative flex flex-col justify-between overflow-hidden group ${sub ? 'border-luxury-emerald/25 hover:border-luxury-emerald/50 hover:shadow-luxury-emerald/5' : 'border-slate-850 hover:border-brand-primary/60'}`}
                                    >
                                        {/* Background Bookmark Symbol */}
                                        <div className="absolute top-0 right-0 p-5 text-slate-800/10 group-hover:text-brand-primary/10 transition-colors pointer-events-none">
                                            <Bookmark size={32} className="fill-current" />
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full text-left">
                                            
                                            {/* Tag Bar */}
                                            <div className="flex items-center justify-between gap-3 mb-4 w-full">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${subColorClass}`}>
                                                    {getSubjectIcon(assignment.subject)}
                                                    <span>{assignment.subject || 'General'}</span>
                                                </div>
                                                
                                                {sub ? (
                                                    <span className="px-2.5 py-1 bg-luxury-emerald/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-luxury-emerald border border-luxury-emerald/20 flex items-center gap-1.5">
                                                        <CheckCircle size={9} /> COMPLETED
                                                    </span>
                                                ) : (
                                                    <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${dueInfo.style}`}>
                                                        <Clock size={9} /> {dueInfo.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title & Description */}
                                            <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-snug mb-2 group-hover:text-brand-primary transition-colors text-left">
                                                {assignment.title}
                                            </h3>
                                            <p className="text-slate-400 text-xs leading-relaxed mb-6 text-left line-clamp-3">
                                                {assignment.description || 'No detailed instructions provided.'}
                                            </p>
                                            
                                            {/* Reference Attachment Card */}
                                            {assignment.fileUrl && (
                                                <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 mb-6 hover:border-slate-800 transition-all text-left">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div className="min-w-0 text-left">
                                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Reference Material</p>
                                                            <p className="text-[10px] font-bold text-slate-350 truncate max-w-[130px]">{assignment.fileUrl.split('/').pop() || 'academic_material.pdf'}</p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={assignment.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center"
                                                        title="Download File"
                                                    >
                                                        <Download size={13} />
                                                    </a>
                                                </div>
                                            )}

                                            {/* Bottom Card Meta Details */}
                                            <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase border ${avatarColor}`}>
                                                        {initials}
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Teacher</p>
                                                        <p className="text-[10px] font-bold text-slate-350 truncate">{teacherName}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Due Date</p>
                                                        <p className="text-[10px] font-bold text-slate-350 leading-tight">
                                                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD'}
                                                        </p>
                                                        <p className="text-[7px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-none">
                                                            Assigned: {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD'}
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center text-rose-450">
                                                        <Calendar size={13} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submission action CTA */}
                                            {!sub ? (
                                                <button 
                                                    onClick={() => setSelectedAssignment(assignment)}
                                                    className="w-full mt-6 py-3.5 bg-brand-primary text-black hover:bg-blue-400 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(88,166,255,0.1)] h-[44px]"
                                                >
                                                    Submit Deliverable <Send size={11} />
                                                </button>
                                            ) : (
                                                <div className="w-full mt-6 py-3.5 bg-slate-950/40 border border-luxury-emerald/30 text-luxury-emerald rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] h-[44px]">
                                                    Done & Uploaded <CheckCircle size={11} />
                                                </div>
                                            )}

                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-slate-900/20 rounded-2xl border border-slate-800/80 border-dashed w-full">
                            <FileText size={48} className="text-slate-700 mx-auto mb-6 opacity-30" />
                            <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-1">No Active Assignments</h3>
                            <p className="text-slate-605 text-xs italic uppercase">There are no pending assignments matches found.</p>
                        </div>
                    )
                ) : (
                    filteredSubmissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
                            {filteredSubmissions.map((sub, idx) => {
                                const subColorClass = getSubjectColor(sub.assignmentId?.subject);
                                
                                return (
                                    <motion.div 
                                        key={sub._id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-gradient-to-b from-slate-900/50 to-slate-950/40 backdrop-blur-2xl border border-slate-850 p-6 rounded-2xl shadow-2xl relative overflow-hidden group flex flex-col justify-between"
                                    >
                                        <div className="relative z-10 flex flex-col h-full text-left">
                                            
                                            {/* Sub header */}
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-805/50">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${subColorClass}`}>
                                                    {getSubjectIcon(sub.assignmentId?.subject)}
                                                    <span>{sub.assignmentId?.subject || 'General'}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Date Unknown'}
                                                </span>
                                            </div>

                                            {/* Sub Title */}
                                            <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-snug mb-1">
                                                {sub.assignmentId?.title || 'Unknown Assignment'}
                                            </h3>

                                            <div className="mt-4 space-y-4">
                                                
                                                {/* Uploaded file chip */}
                                                <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-850">
                                                    <div className="p-2 bg-slate-850 rounded-lg text-slate-400">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1 text-left">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Submitted File</p>
                                                        <p className="text-[10px] font-bold text-slate-300 truncate">{sub.fileUrl?.split('/').pop() || 'deliverable.pdf'}</p>
                                                    </div>
                                                    <a 
                                                        href={sub.fileUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="p-2 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-450 hover:text-white transition-all border border-slate-800"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>

                                                {/* Student comments */}
                                                {sub.comments && (
                                                    <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-xl text-left">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">My Notes</p>
                                                        <p className="text-slate-400 text-xs italic font-medium">{sub.comments}</p>
                                                    </div>
                                                )}

                                                {/* Teacher feedback bubble */}
                                                {sub.feedback ? (
                                                    <div className="p-4 bg-luxury-emerald/5 border border-luxury-emerald/20 rounded-xl text-left space-y-3">
                                                        <div>
                                                            <p className="text-[8px] font-black text-luxury-emerald uppercase tracking-widest leading-none mb-1.5">Teacher Feedback</p>
                                                            <p className="text-slate-300 text-xs italic font-medium leading-relaxed">"{sub.feedback}"</p>
                                                        </div>
                                                        {sub.marksObtained !== undefined && (
                                                            <div className="pt-3 border-t border-luxury-emerald/10 flex justify-between items-center">
                                                                <span className="text-[8px] font-black text-slate-505 uppercase tracking-widest">Score Awarded</span>
                                                                <span className="text-sm font-black text-white italic">{sub.marksObtained} Marks</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-amber-500/5 border border-amber-550/15 rounded-xl text-left flex items-center gap-3">
                                                        <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] font-black text-amber-450 uppercase tracking-wider leading-none mb-1">Awaiting Review</p>
                                                            <p className="text-[10px] text-slate-500 leading-none">Your deliverable has been uploaded and is pending teacher evaluation.</p>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-slate-900/20 rounded-2xl border border-slate-800/80 border-dashed w-full">
                            <Clock size={48} className="text-slate-700 mx-auto mb-6 opacity-30" />
                            <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-1">No Submissions Recorded</h3>
                            <p className="text-slate-605 text-xs italic uppercase">There are no matching submission records found.</p>
                        </div>
                    )
                )}
            </div>

            {/* Submission Modal */}
            <PortalModal isOpen={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} maxWidth="max-w-xl">
                {selectedAssignment && (
                    <div className="p-8 space-y-6 text-left font-outfit">
                        <header className="space-y-2 border-b border-slate-900/60 pb-4 text-left">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Submit Academic Work</h2>
                            <p className="text-slate-455 text-[10px] font-black uppercase tracking-widest leading-none">
                                Assignment: <span className="text-brand-primary">{selectedAssignment.title}</span>
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            
                            {/* Drag & Drop File Zone */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-505 uppercase tracking-widest block ml-1 leading-none">Deliverable Attachment</label>
                                <div 
                                    className={`relative group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${dragActive ? 'border-brand-primary bg-brand-primary/5' : submissionData.file ? 'border-luxury-emerald/50 bg-luxury-emerald/5' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input 
                                        type="file" 
                                        required 
                                        onChange={handleFileChange} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        id="subFile" 
                                    />
                                    
                                    {submissionData.file ? (
                                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                                            <div className="w-12 h-12 rounded-xl bg-luxury-emerald/15 flex items-center justify-center text-luxury-emerald">
                                                <CheckCircle size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-luxury-emerald truncate max-w-xs">
                                                {submissionData.file.name}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                                {(submissionData.file.size / 1024).toFixed(1)} KB // Click or drag to replace
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-805 flex items-center justify-center text-slate-455 group-hover:text-white transition-colors">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-455 group-hover:text-white transition-colors">
                                                Drag & Drop File Here
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">
                                                Or Click To Browse Files
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comments Field */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-505 uppercase tracking-widest block ml-1 leading-none">Additional Notes / Comments</label>
                                <textarea
                                    placeholder="TYPE ANY OPTIONAL COMMENTS OR SUBMISSION REMARKS..."
                                    value={submissionData.comment}
                                    onChange={(e) => setSubmissionData({...submissionData, comment: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white placeholder-slate-700 outline-none focus:border-brand-primary/65 resize-none h-28 tracking-wide transition-all uppercase"
                                />
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAssignment(null);
                                        setSubmissionData({ file: null, comment: '' });
                                    }}
                                    className="flex-1 py-4 bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all border border-slate-800 h-[48px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!submissionData.file}
                                    className="flex-[2] py-4 bg-brand-primary disabled:bg-slate-850 disabled:text-slate-650 disabled:shadow-none hover:bg-blue-450 text-black rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all shadow-xl h-[48px]"
                                >
                                    Transmit Work <Send size={12} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </PortalModal>
        </motion.div>
    );
};

export default Assignments;
