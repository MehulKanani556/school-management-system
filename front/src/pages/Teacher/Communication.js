import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, sendMessage, clearTeacherMessage } from '../../redux/slice/teacher.slice';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Upload, ChevronDown, Activity, Users, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Communication = () => {
    const dispatch = useDispatch();
    const { classes, loading, message } = useSelector((state) => state.teacher);
    const [formData, setFormData] = useState({
        classSection: '',
        targetRole: 'Student',
        subject: '',
        content: '',
        file: null
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTeacherMessage());
            setFormData({ classSection: '', targetRole: 'Student', subject: '', content: '', file: null });
        }
    }, [message, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submission = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) submission.append(key, formData[key]);
        });
        dispatch(sendMessage(submission));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 font-outfit">Signal Relay</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">Broadcasting encrypted institutional signals across assigned academic clusters.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-luxury-emerald/10 border border-luxury-emerald/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-emerald animate-pulse"></div>
                    <span className="text-[10px] font-black text-luxury-emerald uppercase tracking-[0.2em]">Secure Channel Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 xs:p-12 overflow-hidden relative">
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Sector</p>
                                    <div className="relative group text-white">
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <select 
                                            value={formData.classSection} 
                                            onChange={(e) => setFormData({...formData, classSection: e.target.value})}
                                            required
                                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all shadow-inner"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-500">Global Cluster / Sector</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls._id} className="bg-slate-900">Grade {cls.gradeLevel} - {cls.sectionLabel}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Recipient Protocol</p>
                                    <div className="relative group text-white">
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <select 
                                            value={formData.targetRole} 
                                            onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                                            className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none appearance-none focus:border-brand-primary transition-all shadow-inner"
                                        >
                                            <option value="Student" className="bg-slate-900">Student Nodes Only</option>
                                            <option value="Parent" className="bg-slate-900">Parental Oversight Only</option>
                                            <option value="All" className="bg-slate-900">Global Broadcast</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Signal Subject</p>
                                <input 
                                    type="text"
                                    placeholder="Brief Transmission Header..."
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    required
                                    className="w-full bg-slate-800/40 border border-slate-700/50 h-14 px-6 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-brand-primary transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Signal Content</p>
                                <textarea 
                                    placeholder="Drafting mission-critical data..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    required
                                    rows={6}
                                    className="w-full bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] text-[11px] font-medium text-slate-300 outline-none focus:border-brand-primary transition-all shadow-inner resize-none"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <label className="flex-1 flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 border-dashed hover:border-brand-primary hover:bg-brand-primary/5 h-14 px-6 rounded-2xl cursor-pointer transition-all group">
                                    <Upload size={18} className="text-slate-500 group-hover:text-brand-primary" />
                                    <span className={`${formData.file ? 'text-brand-primary' : 'text-slate-500'} text-[11px] font-black uppercase tracking-widest truncate`}>
                                        {formData.file ? formData.file.name : 'Attach Telemetry File'}
                                    </span>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                                        className="hidden" 
                                    />
                                </label>
                                
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full md:w-auto px-12 py-5 bg-brand-primary hover:bg-blue-600 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {loading ? <Activity size={20} className="animate-spin" /> : <Send size={20} />}
                                    INITIATE BROADCAST
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert size={20} className="text-brand-primary" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Broadcast Protocol</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                'Targeted sectors receive instant push notifications.',
                                'Attached telemetry is encrypted and node-locked.',
                                'Global broadcasts reach all parent-student pairs.',
                                'Transmission logs are archived for 90 days.'
                            ].map((info, i) => (
                                <li key={i} className="flex gap-3 text-[10px] font-medium text-slate-500 leading-relaxed">
                                    <div className="w-1 h-1 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                                    {info}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-brand-primary/10 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <Users size={40} className="text-brand-primary mb-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Cluster Stats</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">Active recipients in currently assigned academic sectors.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-2xl font-black text-white font-outfit italic">124</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Students</p>
                            </div>
                            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                                <p className="text-2xl font-black text-white font-outfit italic">118</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Parents</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Communication;
