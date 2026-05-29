import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessonPlans, createLessonPlan, updateLessonPlan, deleteLessonPlan, fetchAssignedClasses, fetchDashboard } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Search, Calendar, BookOpen, Clock, CheckCircle2, MoreVertical, X, FileText, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

const LessonPlans = () => {
    const dispatch = useDispatch();
    const { lessonPlans, classes, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYear } = useSelector((state) => state.academicYear);
    const prevYearRef = useRef(activeAcademicYear);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toastIdRef = useRef(null); // Track active toast to prevent duplicates
    const [formData, setFormData] = useState({
        classSection: '',
        subject: '',
        topic: '',
        subTopics: '',
        date: new Date().toISOString().split('T')[0],
        objectives: '',
        status: 'Draft'
    });

    useEffect(() => {
        // Detect academic year switch
        if (prevYearRef.current && prevYearRef.current !== activeAcademicYear) {
            // Close modal and reset form if year changes mid-flow
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingPlanId(null);
            setFormData({ classSection: '', subject: '', topic: '', subTopics: '', date: new Date().toISOString().split('T')[0], objectives: '', status: 'Draft' });
        }
        prevYearRef.current = activeAcademicYear;

        dispatch(fetchLessonPlans());
        dispatch(fetchAssignedClasses());
        dispatch(fetchDashboard());
    }, [dispatch, activeAcademicYear]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Prevent double submission
        
        setIsSubmitting(true);
        const data = { ...formData, subTopics: formData.subTopics.split(',').map(s => s.trim()) };

        // Dismiss any existing toast
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }

        // Show loading toast and store its ID
        toastIdRef.current = toast.loading(isEditMode ? 'Updating lesson plan...' : 'Saving lesson plan...');

        try {
            const result = isEditMode 
                ? await dispatch(updateLessonPlan({ id: editingPlanId, data })).unwrap()
                : await dispatch(createLessonPlan(data)).unwrap();
            
            // Dismiss loading toast and show success
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.success(isEditMode ? 'Lesson Plan Updated Successfully' : 'Lesson Plan Saved Successfully');
            
            setIsModalOpen(false);
            setIsEditMode(false);
            setEditingPlanId(null);
            setFormData({ classSection: '', subject: '', topic: '', subTopics: '', date: new Date().toISOString().split('T')[0], objectives: '', status: 'Draft' });
        } catch (error) {
            // Dismiss loading toast and show error
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.error(error || `Failed to ${isEditMode ? 'update' : 'save'} lesson plan`);
        } finally {
            setIsSubmitting(false);
            toastIdRef.current = null;
        }
    };

    const handleEdit = (plan) => {
        setIsEditMode(true);
        setEditingPlanId(plan._id);
        
        const classId = plan.classSection && typeof plan.classSection === 'object' ? plan.classSection._id : (plan.classSection || '');
        const subjectId = plan.subject && typeof plan.subject === 'object' ? plan.subject._id : (plan.subject || '');

        setFormData({
            classSection: classId,
            subject: subjectId,
            topic: plan.topic || '',
            subTopics: Array.isArray(plan.subTopics) ? plan.subTopics.join(', ') : (plan.subTopics || ''),
            date: plan.date ? moment(plan.date).format('YYYY-MM-DD') : '',
            objectives: plan.objectives || '',
            status: plan.status || 'Draft'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this lesson plan?')) return;
        
        if (isSubmitting) return; // Prevent double submission
        
        setIsSubmitting(true);

        // Dismiss any existing toast
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }

        // Show loading toast and store its ID
        toastIdRef.current = toast.loading('Deleting lesson plan...');

        try {
            await dispatch(deleteLessonPlan(planId)).unwrap();
            
            // Dismiss loading toast and show success
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.success('Lesson Plan Deleted Successfully');
        } catch (error) {
            // Dismiss loading toast and show error
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = toast.error(error || 'Failed to delete lesson plan');
        } finally {
            setIsSubmitting(false);
            toastIdRef.current = null;
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingPlanId(null);
        setFormData({ classSection: '', subject: '', topic: '', subTopics: '', date: new Date().toISOString().split('T')[0], objectives: '', status: 'Draft' });
    };

    const filteredPlans = lessonPlans?.filter(p =>
        p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-md border border-slate-800/60 backdrop-blur-xl group">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform">
                            <ClipboardList className="text-brand-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Lesson <span className="text-brand-primary">Plans</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Create and Manage Your Academic Lesson Plans</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-md font-black uppercase text-[11px] tracking-widest transition-all shadow-[0_0_30px_-5px_rgba(var(--brand-primary-rgb),0.3)] hover:-translate-y-1"
                >
                    <Plus size={18} />
                    Add New Lesson Plan
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH TOPICS OR SUBJECTS..."
                        className="w-full bg-slate-900/40 border border-slate-800/80 rounded-md py-4 pl-16 pr-6 text-[11px] font-bold tracking-widest uppercase focus:border-brand-primary transition-all text-white placeholder-slate-600 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredPlans?.map((plan, i) => (
                        <motion.div
                            key={plan._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-slate-900/40 border border-slate-800/60 rounded-md p-6 hover:border-brand-primary/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700/50 text-[9px] font-black text-brand-primary uppercase tracking-widest">
                                    {plan.subject?.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${plan.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            plan.status === 'Published' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                                                'bg-slate-700/40 border-slate-600/50 text-slate-400'
                                        }`}>
                                        {plan.status}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-black uppercase font-outfit mb-2 group-hover:text-brand-primary transition-colors">{plan.topic}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ChevronRight size={12} className="text-brand-primary" />
                                {plan.classSection?.standardId?.level 
                                    ? `Grade ${plan.classSection.standardId.level}${plan.classSection.standardId.name ? ` (${plan.classSection.standardId.name})` : ''} - Section ${plan.classSection.sectionLabel}` 
                                    : plan.classSection?.sectionLabel}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                                        <Calendar size={14} className="text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(plan.date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                                        <BookOpen size={14} className="text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{plan.subTopics?.length || 0} Sub-topics</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-8">
                                <button
                                    onClick={() => { setSelectedPlan(plan); setIsDetailOpen(true); }}
                                    className="flex-1 py-3 rounded-md border border-slate-800 hover:border-brand-primary text-[10px] font-black uppercase tracking-widest group-hover:bg-brand-primary/10 transition-all text-slate-400 hover:text-brand-primary"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="px-4 py-3 rounded-md border border-slate-800 hover:border-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/10 transition-all text-slate-400 hover:text-blue-400"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    className="px-4 py-3 rounded-md border border-slate-800 hover:border-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all text-slate-400 hover:text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-2xl p-4">
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-slate-900 border border-slate-800 w-full rounded-md overflow-hidden relative shadow-2xl"
                            >
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Plus className="text-brand-primary" size={20} />
                                    <h2 className="text-xl font-black uppercase font-outfit tracking-wider">
                                        {isEditMode ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
                                    </h2>
                                </div>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-800 rounded-md transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Class/Section</label>
                                        <select
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.classSection}
                                            onChange={(e) => {
                                                const classId = e.target.value;
                                                const selectedClassObj = classes?.find(c => c._id === classId);
                                                const firstSubjectId = selectedClassObj?.subjects?.[0]?._id || '';
                                                setFormData({ ...formData, classSection: classId, subject: firstSubjectId });
                                            }}
                                        >
                                            <option value="">SELECT CLASS</option>
                                            {classes?.map(c => <option key={c._id} value={c._id}>{c.standardId?.level} - {c.sectionLabel}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                                        <select
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="">SELECT SUBJECT</option>
                                            {/* Show subjects belonging to the selected class */}
                                            {formData.classSection ? (
                                                classes?.find(c => c._id === formData.classSection)?.subjects?.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name}</option>
                                                ))
                                            ) : (
                                                <option disabled>Please select a class first</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lesson Topic</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="E.G. ALGEBRA FUNDAMENTALS"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sub-Topics (Comma Separated)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="Introduction, Concepts, Examples..."
                                        value={formData.subTopics}
                                        onChange={(e) => setFormData({ ...formData, subTopics: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lesson Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Draft">DRAFT</option>
                                            <option value="Published">PUBLISHED</option>
                                            <option value="Completed">COMPLETED</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lesson Objectives</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-medium tracking-tight outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="Outline the learning objectives for this lesson..."
                                        value={formData.objectives}
                                        onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? 'PROCESSING...' : (isEditMode ? 'UPDATE LESSON PLAN' : 'SAVE LESSON PLAN')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
                )}
            </AnimatePresence>
            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedPlan && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
                            onClick={() => setIsDetailOpen(false)}
                        />
                        <div className="relative z-10 w-full max-w-3xl p-4">
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                className="bg-slate-900 border border-brand-primary/20 w-full rounded-xl overflow-hidden relative shadow-2xl font-inter"
                            >
                                <div className="py-7 px-10 border-b border-slate-800 flex justify-between items-start bg-gradient-to-b from-slate-800/20 to-transparent">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="px-3 py-1 bg-brand-primary/10 rounded-sm border border-brand-primary/30 text-[9px] font-black text-brand-primary uppercase tracking-widest leading-none">
                                                {selectedPlan.subject?.name}
                                            </div>
                                            <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">
                                                {selectedPlan.classSection?.standardId?.level
                                                    ? `${selectedPlan.classSection.standardId.name ? ` ${selectedPlan.classSection.standardId.name}` : ''} — ${selectedPlan.classSection.sectionLabel}`
                                                    : selectedPlan.classSection?.sectionLabel}
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-black uppercase font-outfit tracking-tighter text-white">{selectedPlan.topic}</h2>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                            <Calendar size={12} className="text-brand-primary" />
                                            CREATED ON {moment(selectedPlan.date).format('MMMM DD, YYYY').toUpperCase()}
                                        </p>
                                    </div>
                                    <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><X size={20} /></button>
                                </div>

                                <div className="py-8 px-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <section className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/80 italic">
                                            <CheckCircle2 size={16} /> 1. Lesson Objectives
                                        </h4>
                                        <div className="bg-slate-950/40 p-7 rounded-xl border border-white/5 shadow-inner">
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium whitespace-pre-wrap italic">
                                                {selectedPlan.objectives || 'No learning objectives specified for this lesson plan.'}
                                            </p>
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/80 italic">
                                            <Clock size={16} /> 2. Sub-Topics Breakdown
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedPlan.subTopics?.length > 0 ? selectedPlan.subTopics.map((sub, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-5 bg-slate-800/20 rounded-xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-brand-primary/20 flex items-center justify-center font-black text-[10px] text-brand-primary group-hover:scale-110 transition-transform shadow-lg">
                                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{sub}</span>
                                                </div>
                                            )) : (
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic col-span-2 text-center py-6">No sub-topics added for this lesson.</p>
                                            )}
                                        </div>
                                    </section>

                                    <div className="pt-8 border-t border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedPlan.status === 'Completed' ? 'bg-emerald-500' : 'bg-brand-primary'} animate-pulse`}></div>
                                            STATUS: {selectedPlan.status}
                                        </div>
                                        <div className="font-mono opacity-50">PLAN_ID: {selectedPlan._id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LessonPlans;
