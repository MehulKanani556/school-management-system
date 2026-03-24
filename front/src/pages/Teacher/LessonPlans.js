import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessonPlans, createLessonPlan, fetchAssignedClasses, fetchDashboard } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Search, Calendar, BookOpen, Clock, CheckCircle2, MoreVertical, X, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LessonPlans = () => {
    const dispatch = useDispatch();
    const { lessonPlans, classes, loading } = useSelector((state) => state.teacher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
        dispatch(fetchLessonPlans());
        dispatch(fetchAssignedClasses());
        dispatch(fetchDashboard());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...formData, subTopics: formData.subTopics.split(',').map(s => s.trim()) };
        const res = await dispatch(createLessonPlan(data));
        if (res.meta.requestStatus === 'fulfilled') {
            toast.success('Pedagogical directive ARCHIVED');
            setIsModalOpen(false);
            setFormData({ classSection: '', subject: '', topic: '', subTopics: '', date: new Date().toISOString().split('T')[0], objectives: '', status: 'Draft' });
        }
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
                        <h1 className="text-3xl font-black uppercase tracking-tight font-outfit">Lesson <span className="text-brand-primary">Matrix</span></h1>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Archive & Orchestrate Pedagogical Delivery</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-md font-black uppercase text-[11px] tracking-widest transition-all shadow-[0_0_30px_-5px_rgba(var(--brand-primary-rgb),0.3)] hover:-translate-y-1"
                >
                    <Plus size={18} />
                    Integrate New Logic
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
                                <div className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${
                                    plan.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                    plan.status === 'Published' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 
                                    'bg-slate-700/40 border-slate-600/50 text-slate-400'
                                }`}>
                                    {plan.status}
                                </div>
                            </div>

                            <h3 className="text-lg font-black uppercase font-outfit mb-2 group-hover:text-brand-primary transition-colors">{plan.topic}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ChevronRight size={12} className="text-brand-primary" />
                                {plan.classSection?.sectionLabel}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                                        <Calendar size={14} className="text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center">
                                        <BookOpen size={14} className="text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{plan.subTopics?.length || 0} Sub-modules</span>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-3 rounded-md border border-slate-800 hover:border-brand-primary text-[10px] font-black uppercase tracking-widest group-hover:bg-brand-primary/10 transition-all text-slate-400 hover:text-brand-primary">
                                Expand Logic Flow
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-md overflow-hidden relative shadow-2xl z-10"
                        >
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Plus className="text-brand-primary" size={20} />
                                    <h2 className="text-xl font-black uppercase font-outfit tracking-wider">Integrate Pedagogical Logic</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-colors"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Sector</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.classSection}
                                            onChange={(e) => setFormData({...formData, classSection: e.target.value})}
                                        >
                                            <option value="">SELECT SECTOR</option>
                                            {classes?.map(c => <option key={c._id} value={c._id}>{c.sectionLabel} ({c.standardId?.name})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Knowledge Domain</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        >
                                            <option value="">SELECT DOMAIN</option>
                                            {/* Get unique subjects from assigned classes */}
                                            {Array.from(new Map(classes?.flatMap(c => c.subjects || []).filter(Boolean).map(s => [s._id, s])).values()).map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Module Topic</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="E.G. QUANTUM COMPUTING PRINCIPLES"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sub-Modules (Comma Separated)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="Qubits, Superposition, Entanglement..."
                                        value={formData.subTopics}
                                        onChange={(e) => setFormData({...formData, subTopics: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Protocol Date</label>
                                        <input 
                                            required
                                            type="date" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manifest Status</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        >
                                            <option value="Draft">DRAFT</option>
                                            <option value="Published">PUBLISHED</option>
                                            <option value="Completed">COMPLETED</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cognitive Objectives</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-4 text-[11px] font-medium tracking-tight outline-none focus:border-brand-primary text-white placeholder-slate-600"
                                        placeholder="Outline the pedagogical objectives for this module..."
                                        value={formData.objectives}
                                        onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg hover:-translate-y-1"
                                >
                                    ARCHIVE DIRECTIVE
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LessonPlans;
