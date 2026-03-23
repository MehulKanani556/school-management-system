import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchClassStudents, scheduleMeeting, fetchMeetings } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Search, Plus, X, Video, MapPin, CheckCircle2, MoreVertical, MessageSquare, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PTMMeetings = () => {
    const dispatch = useDispatch();
    const { classes, students, meetings, loading } = useSelector((state) => state.teacher);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '10:30',
        meetingType: 'Physical',
        meetingLink: ''
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchMeetings());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassStudents(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(scheduleMeeting(formData));
        if (res.meta.requestStatus === 'fulfilled') {
            toast.success('PTM PROTOCOL ARCHIVED');
            setIsModalOpen(false);
            setFormData({ studentId: '', title: '', description: '', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:30', meetingType: 'Physical', meetingLink: '' });
        }
    };

    const upcomingMeetings = meetings?.filter(m => new Date(m.date) >= new Date().setHours(0,0,0,0));
    const pastMeetings = meetings?.filter(m => new Date(m.date) < new Date().setHours(0,0,0,0));

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-900/60 p-10 rounded-md border border-slate-800/80 backdrop-blur-2xl shadow-2xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border border-white/5 shadow-inner shadow-white/10 group-hover:scale-105 transition-all">
                            <Calendar className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit leading-none mb-1">PTM <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Protocols</span></h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Coordinate Pedagogical Assessment Synchronizations</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-4 bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_0_50px_-10px_rgba(var(--brand-primary-rgb),0.4)] hover:-translate-y-1 active:scale-95"
                    >
                        <Plus size={20} />
                        INITIATE PROTOCOL
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upcoming Meetings List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-primary/40 to-transparent"></div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Scheduled Synchronizations</h2>
                    </div>

                    <div className="grid gap-6">
                        <AnimatePresence mode='popLayout'>
                            {upcomingMeetings?.map((m, i) => (
                                <motion.div 
                                    key={m._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-slate-900/60 border border-slate-800/80 rounded-md p-8 hover:border-brand-primary/40 transition-all group relative backdrop-blur-xl shadow-xl hover:shadow-brand-primary/5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-md bg-slate-800 border-2 border-slate-700/50 flex flex-col items-center justify-center p-2 group-hover:border-brand-primary/30 transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{new Date(m.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-white">{new Date(m.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase font-outfit tracking-wide mb-1 text-slate-100 group-hover:text-brand-primary transition-colors">{m.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{m.studentId?.firstName} {m.studentId?.lastName}</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.startTime} - {m.endTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-6 py-2.5 rounded-md border text-[9px] font-black uppercase tracking-widest shadow-inner ${
                                            m.meetingType === 'Virtual' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700/50 text-slate-400 shadow-white/5'
                                        }`}>
                                            {m.meetingType === 'Virtual' ? <Video size={10} className="inline mr-2" /> : <MapPin size={10} className="inline mr-2" />}
                                            {m.meetingType} SECTOR
                                        </div>
                                    </div>

                                    {m.description && <p className="text-[11px] font-medium text-slate-500 italic mb-8 border-l-2 border-brand-primary/20 pl-4">{m.description}</p>}

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">U{i}</div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-brand-primary/10 flex items-center justify-center text-[8px] font-black text-brand-primary">+1</div>
                                        </div>
                                        {m.meetingType === 'Virtual' ? (
                                            <button className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 text-[10px] font-black uppercase tracking-widest bg-cyan-900/10 hover:bg-cyan-900/20 px-6 py-2.5 rounded-md transition-all border border-cyan-500/20">
                                                Initialize Link
                                                <ChevronRight size={14} />
                                            </button>
                                        ) : (
                                            <button className="flex items-center gap-3 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-md transition-all border border-slate-800 hover:border-slate-700">
                                                Protocol Detail
                                                <ChevronRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {upcomingMeetings?.length === 0 && (
                            <div className="py-24 border-2 border-dashed border-slate-800/60 rounded-md text-center group hover:border-brand-primary/30 transition-all">
                                <Users size={40} className="mx-auto text-slate-800 group-hover:text-brand-primary/30 transition-all mb-4" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-all italic">No Upcoming Synchronizations Scheduled</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar / Past Meetings Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-950/40 p-1 rounded-md border border-slate-800/60">
                        <div className="p-8 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-4 flex items-center justify-between">
                                Temporal Summary
                                <CheckCircle2 size={14} className="text-brand-primary" />
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-6 rounded-md border border-slate-800 group/s">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/s:text-brand-primary transition-colors">Pending</p>
                                    <p className="text-3xl font-black font-outfit text-white group-hover/s:scale-110 transition-transform origin-left">{upcomingMeetings?.length || 0}</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-md border border-slate-800 group/s">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/s:text-emerald-400 transition-colors">Archived</p>
                                    <p className="text-3xl font-black font-outfit text-white opacity-40 group-hover/s:opacity-100 transition-opacity origin-left">{pastMeetings?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 italic">Historical Archives (Recent Past)</h2>
                        {pastMeetings?.slice(0, 3).map((m, i) => (
                            <div key={m._id} className="bg-slate-900/40 border border-slate-800 rounded-md p-6 border-l-2 border-slate-700 opacity-60 hover:opacity-100 transition-all group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{new Date(m.date).toLocaleDateString()}</p>
                                <h4 className="text-[11px] font-black uppercase tracking-wider mb-2 group-hover:text-brand-primary transition-all">{m.title}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{m.studentId?.firstName} {m.studentId?.lastName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Creation Matrix Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)} />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 50 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.95, opacity: 0, y: 50 }} 
                            className="bg-slate-900 border border-slate-800/80 w-full max-w-2xl rounded-md overflow-hidden relative shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] z-10"
                        >
                            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.1)] group-hover:scale-110 transition-transform">
                                        <Plus className="text-brand-primary" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase font-outfit tracking-tighter mb-1">Schedule PTM protocol</h2>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Configure Synchronization Manifest</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-800 rounded-md transition-all text-slate-500 hover:text-white hover:rotate-90"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-900/20">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Sector</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white transition-all hover:bg-slate-900"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                        >
                                            <option value="">SELECT SECTOR</option>
                                            {classes?.map(c => <option key={c._id} value={c._id}>{c.sectionLabel}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Student</label>
                                        <select 
                                            required
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white transition-all hover:bg-slate-900"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        >
                                            <option value="">SELECT SUBJECT</option>
                                            {students?.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meeting Identifier</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-700 transition-all hover:bg-slate-900"
                                        placeholder="E.G. SEMESTER II ACADEMIC PERFORMANCE REVIEW"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Date</label>
                                        <input 
                                            required
                                            type="date" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initiation Time</label>
                                        <input 
                                            required
                                            type="time" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Conclusion Time</label>
                                        <input 
                                            required
                                            type="time" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-950/50 p-6 rounded-md border border-slate-800/80">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Synchronization Channel</label>
                                        <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800">
                                            {['Physical', 'Virtual'].map(t => (
                                                <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, meetingType: t})}
                                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${formData.meetingType === t ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-600 hover:text-slate-400'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {formData.meetingType === 'Virtual' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                                <Video size={12} className="text-cyan-400" />
                                                Video Protocol Link
                                            </label>
                                            <input 
                                                type="url" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black text-cyan-400 outline-none focus:border-cyan-500/50 transition-all"
                                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                value={formData.meetingLink}
                                                onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Internal Description / Memo</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-medium tracking-tight outline-none focus:border-brand-primary text-white placeholder-slate-700 italic"
                                        placeholder="Outline the protocol objectives or concerns for this synchronization..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white py-6 rounded-md font-black uppercase text-[12px] tracking-[0.3em] transition-all shadow-[0_20px_40px_-15px_rgba(var(--brand-primary-rgb),0.3)] hover:-translate-y-1 active:scale-95"
                                >
                                    ARCHIVE PROTOCOL
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PTMMeetings;
