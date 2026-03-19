import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAssignedClasses, 
    uploadAssignment, 
    fetchAssignments, 
    deleteAssignment,
    updateAssignment,
    clearTeacherMessage,
    setTeacherError 
} from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, ChevronDown, Activity, Send, 
    FileText, Calendar, Trash2, Edit3, 
    Plus, X, ExternalLink, School
} from 'lucide-react';

const Assignments = () => {
    const dispatch = useDispatch();
    const { classes, assignments, loading, message } = useSelector((state) => state.teacher);
    
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [editMode, setEditMode] = useState(null); // Assignment object for editing
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        file: null
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchAssignments());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            resetForm();
            setViewMode('list');
        }
    }, [message]);

    const resetForm = () => {
        setFormData({ title: '', description: '', subject: '', dueDate: '', file: null });
        setSelectedClass('');
        setEditMode(null);
    };

    const handleEdit = (assignment) => {
        // Ensure we extract the ID if classSection is populated, otherwise use it directly
        const classId = typeof assignment.classSection === 'object' ? assignment.classSection._id : assignment.classSection;
        
        setEditMode(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            subject: assignment.subject,
            dueDate: new Date(assignment.dueDate).toISOString().split('T')[0],
            file: null
        });
        setSelectedClass(classId || '');
        setViewMode('form');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedClass) return dispatch(setTeacherError('Academic Sector node required'));
        if (!formData.subject) return dispatch(setTeacherError('Curriculum Subject identity required'));

        const submission = new FormData();
        submission.append('classSection', selectedClass);
        Object.keys(formData).forEach(key => {
            if (formData[key]) submission.append(key, formData[key]);
        });

        if (editMode) {
            dispatch(updateAssignment({ id: editMode._id, formData: submission }));
        } else {
            dispatch(uploadAssignment(submission));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Decommission this structural assignment?')) {
            dispatch(deleteAssignment(id));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 container">
            {/* Header Identity */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit">Homework Stream</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide flex items-center gap-2">
                        <Activity size={14} className="text-brand-primary" />
                        Instructional material lifecycle management registry.
                    </p>
                </div>
                
                <button 
                    onClick={() => {
                        if(viewMode === 'form') resetForm();
                        setViewMode(viewMode === 'list' ? 'form' : 'list');
                    }}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${viewMode === 'list' ? 'bg-brand-primary text-white hover:bg-blue-600' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
                >
                    {viewMode === 'list' ? <Plus size={16} /> : <X size={16} />}
                    {viewMode === 'list' ? 'Provision New' : 'Return to Registry'}
                </button>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'form' ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 xs:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                        
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Academic Sector</p>
                                    <div className="relative group">
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <select 
                                            value={selectedClass} 
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-500">Select Section</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls._id} className="bg-slate-900 text-white">Grade {cls.standardId?.gradeLevel} - {cls.sectionLabel}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Curriculum Subject</p>
                                    <div className="relative group">
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <select 
                                            value={formData.subject} 
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            required
                                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-500">Select Subject</option>
                                            {(classes.find(c => c._id === selectedClass)?.subjects || []).map(sub => (
                                                <option key={sub._id} value={sub.name} className="bg-slate-900 text-white">{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Homework Module Title</p>
                                <input 
                                    type="text"
                                    placeholder="Task Header..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Protocol & Data Range</p>
                                <textarea 
                                    placeholder="Specify task requirements..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                    className="w-full bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] text-[11px] font-medium text-slate-300 outline-none focus:border-brand-primary transition-all shadow-inner resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-luxury-rose">Submission Limit</p>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input 
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                            required
                                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 pl-14 pr-6 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Attachment Upload</p>
                                    <label className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 border-dashed hover:border-brand-primary hover:bg-brand-primary/5 h-14 px-6 rounded-2xl cursor-pointer transition-all group">
                                        <Upload size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                                        <span className={`${formData.file ? 'text-brand-primary' : 'text-slate-500'} text-[11px] font-black uppercase tracking-widest truncate max-w-[150px]`}>
                                            {formData.file ? formData.file.name : (editMode && editMode.fileUrl ? 'Re-upload File' : 'Select Identifier')}
                                        </span>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                                            className="hidden" 
                                        />
                                    </label>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-5 bg-brand-primary hover:bg-blue-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {loading ? <Activity size={20} className="animate-spin" /> : <Send size={20} />}
                                {editMode ? 'UPDATE PROTOCOL' : 'PUBLISH ASSIGNMENT'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {assignments.length > 0 ? assignments.map((assignment) => (
                            <motion.div 
                                key={assignment._id}
                                layoutId={assignment._id}
                                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 group hover:border-brand-primary/40 transition-all shadow-xl relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(assignment)} className="p-2 text-slate-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDelete(assignment._id)} className="p-2 text-slate-500 hover:text-luxury-rose transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-white font-black uppercase italic tracking-tight leading-none mb-1.5">{assignment.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{assignment.subject}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                Grade {assignment.classSection?.standardId?.gradeLevel} - {assignment.classSection?.sectionLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-3">
                                        {assignment.description}
                                    </p>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Deadline</span>
                                            <span className="text-[11px] font-bold text-luxury-rose leading-none uppercase">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        {assignment.fileUrl && (
                                            <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center opacity-40">
                                <School size={48} className="mb-4 text-slate-600" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Node Registry Empty</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Assignments;
