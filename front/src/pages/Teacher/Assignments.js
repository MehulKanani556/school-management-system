import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchAssignedClasses, uploadAssignment, clearTeacherMessage } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { Upload, ChevronDown, Activity, Send, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Assignments = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialClassId = query.get('classId');

    const { classes, loading, message } = useSelector((state) => state.teacher);
    const [selectedClass, setSelectedClass] = useState(initialClassId || '');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        file: null
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
            setFormData({ title: '', description: '', subject: '', dueDate: '', file: null });
        }
    }, [message, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedClass) return toast.error('Selection of class node required');

        const submission = new FormData();
        submission.append('classSection', selectedClass);
        Object.keys(formData).forEach(key => {
            if (formData[key]) submission.append(key, formData[key]);
        });
        dispatch(uploadAssignment(submission));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
            <header>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit">Digital Repository</h1>
                <p className="text-slate-500 font-medium text-sm tracking-wide">Provisioning instructional materials across active academic sectors.</p>
            </header>

            <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 xs:p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Class Selection */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Sector</p>
                            <div className="relative group">
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all text-white"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">Select Section</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id} className="bg-slate-900 text-white">Grade {cls.gradeLevel} - {cls.sectionLabel}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Subject Input */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Instructional Subject</p>
                            <input 
                                type="text"
                                placeholder="Subject Identity..."
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                required
                                className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2.5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assignment Title</p>
                        <input 
                            type="text"
                            placeholder="Provision Header..."
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary transition-all shadow-inner"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Scope & Instructions</p>
                        <textarea 
                            placeholder="Detailed protocol for this task..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            className="w-full bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] text-[11px] font-medium text-slate-300 outline-none focus:border-brand-primary transition-all shadow-inner resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Due Date */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-luxury-rose">Submission Deadline</p>
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

                        {/* File Upload */}
                        <div className="space-y-2.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Attachment Provision</p>
                            <label className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 border-dashed hover:border-brand-primary hover:bg-brand-primary/5 h-14 px-6 rounded-2xl cursor-pointer transition-all group">
                                <Upload size={18} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                                <span className={`${formData.file ? 'text-brand-primary' : 'text-slate-500'} text-[11px] font-black uppercase tracking-widest truncate max-w-[150px]`}>
                                    {formData.file ? formData.file.name : 'Select File'}
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
                        PROVISION ASSIGNMENT
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default Assignments;
