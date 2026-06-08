import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchClassStudents, scheduleMeeting, fetchMeetings, updateMeeting } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Search, Plus, X, Video, MapPin, CheckCircle2, MoreVertical, MessageSquare, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PortalModal from '../../components/PortalModal';

const PTMMeetings = () => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { classes, students, meetings, loading } = useSelector((state) => state.teacher);
    const { activeAcademicYearId } = useSelector((state) => state.academicYear || {});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '10:30',
        meetingType: 'In-Person',
        meetingLink: '',
        scope: 'Individual',
        classSection: ''
    });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchMeetings());
    }, [dispatch, activeAcademicYearId]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassStudents(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const handleDetail = (meeting) => {
        setCurrentMeeting(meeting);
        setIsDetailOpen(true);
    };

    const handleJoinLink = (url) => {
        if (url) window.open(url, '_blank');
        else toast.error('Meeting link not available');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(scheduleMeeting(formData));
        if (res.meta.requestStatus === 'fulfilled') {
            setIsModalOpen(false);
            setFormData({ studentId: '', title: '', description: '', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:30', meetingType: 'In-Person', meetingLink: '', scope: 'Individual', classSection: '' });
            setSelectedClass('');
        }
    };

    const handleComplete = async (meetingId) => {
        if (!await window.confirm('Mark this PTM meeting as completed?')) return;
        const res = await dispatch(updateMeeting({ id: meetingId, data: { status: 'Completed' } }));
        if (res.meta.requestStatus === 'fulfilled') {
            dispatch(fetchMeetings());
        }
    };

    const upcomingMeetings = meetings?.filter(m => m.status === 'Scheduled');
    const pastMeetings = meetings?.filter(m => m.status === 'Completed');

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
                            <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit leading-none mb-1">PTM <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Meetings</span></h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Schedule and Manage Parent-Teacher Meetings</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-4 bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-5 rounded-md font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_0_50px_-10px_rgba(var(--brand-primary-rgb),0.4)] hover:-translate-y-1 active:scale-95"
                    >
                        <Plus size={20} />
                        SCHEDULE MEETING
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upcoming Meetings List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-primary/40 to-transparent"></div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Scheduled Meetings</h2>
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
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{new Date(m.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-white">{new Date(m.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase font-outfit tracking-wide mb-1 text-slate-100 group-hover:text-brand-primary transition-colors">{m.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{m.studentId?.firstName} {m.studentId?.lastName}</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono italic">{m.startTime} - {m.endTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-6 py-2.5 rounded-md border text-[9px] font-black uppercase tracking-widest shadow-inner ${
                                            (m.meetingType === 'Online' || m.meetingType === 'Virtual') ? 'bg-teacher-primary/10 border-teacher-primary/30 text-teacher-primary' : 'bg-slate-800 border-slate-700/50 text-slate-400 shadow-white/5'
                                        }`}>
                                            {(m.meetingType === 'Online' || m.meetingType === 'Virtual') ? <Video size={10} className="inline mr-2" /> : <MapPin size={10} className="inline mr-2" />}
                                            {m.meetingType} 
                                        </div>
                                    </div>

                                    {m.description && <p className="text-[11px] font-medium text-slate-500 italic mb-8 border-l-2 border-brand-primary/20 pl-4">{m.description.substring(0, 100)}...</p>}

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-brand-primary/20 flex items-center justify-center text-[8px] font-black text-brand-primary">
                                                    {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                                                </div>
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                                                    {m.scope === 'Class' ? 'ALL' : (m.studentId?.firstName?.charAt(0) || '') + (m.studentId?.lastName?.charAt(0) || '')}
                                                </div>
                                                {m.parentId && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">P</div>
                                                )}
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-tighter text-slate-600">
                                                {m.scope === 'Class' ? 'CLASS MEETING' : 'INDIVIDUAL MEETING'}
                                            </span>
                                        </div>
                                        {(m.meetingType === 'Online' || m.meetingType === 'Virtual') ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleJoinLink(m.meetingLink)}
                                                    className="flex items-center gap-3 text-teacher-primary hover:text-teacher-primary text-[10px] font-black uppercase tracking-widest bg-cyan-900/10 hover:bg-cyan-900/20 px-6 py-2.5 rounded-md transition-all border border-teacher-primary/20"
                                                >
                                                    Join Meeting
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleComplete(m._id)}
                                                    className="flex items-center gap-2 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-6 py-2.5 rounded-md transition-all border border-emerald-500/20"
                                                >
                                                    Complete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleDetail(m)}
                                                    className="flex items-center gap-3 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-md transition-all border border-slate-800 hover:border-slate-700"
                                                >
                                                    Meeting Details
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleComplete(m._id)}
                                                    className="flex items-center gap-2 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-6 py-2.5 rounded-md transition-all border border-emerald-500/20"
                                                >
                                                    Complete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {upcomingMeetings?.length === 0 && (
                            <div className="py-24 border-2 border-dashed border-slate-800/60 rounded-md text-center group hover:border-brand-primary/30 transition-all">
                                <Users size={40} className="mx-auto text-slate-800 group-hover:text-brand-primary/30 transition-all mb-4" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-400 transition-all italic">No Upcoming Meetings Scheduled</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar / Past Meetings Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-950/40 p-1 rounded-md border border-slate-800/60">
                        <div className="p-8 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-4 flex items-center justify-between">
                                Meeting Summary
                                <CheckCircle2 size={14} className="text-brand-primary" />
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-6 rounded-md border border-slate-800 group/s">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/s:text-brand-primary transition-colors">Scheduled</p>
                                    <p className="text-3xl font-black font-outfit text-white group-hover/s:scale-110 transition-transform origin-left">{upcomingMeetings?.length || 0}</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-md border border-slate-800 group/s">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/s:text-emerald-400 transition-colors">Completed</p>
                                    <p className="text-3xl font-black font-outfit text-white opacity-40 group-hover/s:opacity-100 transition-opacity origin-left">{pastMeetings?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 italic">Past Meetings</h2>
                        {pastMeetings?.slice(0, 3).map((m, i) => (
                            <div 
                                key={m._id} 
                                onClick={() => handleDetail(m)}
                                className="bg-brand-surface/40 border border-brand-border rounded-md p-6 border-l-2 opacity-60 hover:opacity-100 transition-all group cursor-pointer"
                            >
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{new Date(m.date).toLocaleDateString('en-IN')}</p>
                                <h4 className="text-[11px] font-black uppercase tracking-wider mb-2 group-hover:text-teacher-primary transition-all">{m.title}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{m.studentId?.firstName} {m.studentId?.lastName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                            <Plus className="text-brand-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase font-outfit tracking-tighter">Schedule PTM Meeting</h2>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Enter Meeting Details</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-all text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            {['Individual', 'Class'].map(s => (
                                <button key={s} type="button" onClick={() => setFormData({...formData, scope: s})} className={`flex-1 py-3 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${formData.scope === s ? 'bg-brand-primary border-brand-primary text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>{s} Meeting</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Class/Section</label>
                                <select required className="w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white transition-all appearance-none" value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setFormData({...formData, classSection: e.target.value}); }}>
                                    <option value="">SELECT CLASS</option>
                                    {classes?.map(c => (<option key={c._id} value={c._id}>Std {c.standardId?.level || c.gradeLevel} ({c.sectionLabel})</option>))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Student Name</label>
                                <select required={formData.scope === 'Individual'} disabled={formData.scope === 'Class'} className={`w-full bg-slate-950 border border-slate-800 rounded-md p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white transition-all appearance-none ${formData.scope === 'Class' ? 'opacity-30' : ''}`} value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})}>
                                    <option value="">{formData.scope === 'Class' ? 'NOT APPLICABLE' : 'SELECT STUDENT'}</option>
                                    {students?.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meeting Title</label>
                        <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-brand-primary text-white placeholder-slate-700 transition-all" placeholder="E.G. SEMESTER II PERFORMANCE REVIEW" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label><input required type="date" className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black outline-none focus:border-brand-primary text-white" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Start</label><input required type="time" className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black outline-none focus:border-brand-primary text-white" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">End</label><input required type="time" className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black outline-none focus:border-brand-primary text-white" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} /></div>
                    </div>
                    <div className="space-y-4 bg-slate-950/50 p-6 rounded-md border border-slate-800/80">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meeting Mode</label>
                            <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800">
                                {['In-Person', 'Online'].map(t => (<button key={t} type="button" onClick={() => setFormData({...formData, meetingType: t})} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${formData.meetingType === t ? 'bg-brand-primary text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>))}
                            </div>
                        </div>
                        {formData.meetingType === 'Online' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2"><Video size={12} className="text-teacher-primary" />Meeting Link</label>
                                <input type="url" className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-black text-teacher-primary outline-none focus:border-teacher-primary/50 transition-all font-mono" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={formData.meetingLink} onChange={(e) => setFormData({...formData, meetingLink: e.target.value})} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description / Notes</label>
                        <textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-md p-5 text-[11px] font-medium outline-none focus:border-brand-primary text-white placeholder-slate-700 italic" placeholder="Outline the meeting agenda or points for discussion..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-6 rounded-md font-black uppercase text-[12px] tracking-[0.3em] transition-all shadow-lg hover:-translate-y-1 active:scale-95">SAVE MEETING</button>
                </form>
            </PortalModal>

            {/* Detail Modal */}
            <PortalModal isOpen={isDetailOpen && !!currentMeeting} onClose={() => setIsDetailOpen(false)} maxWidth="max-w-xl">
                {currentMeeting && (
                    <>
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center"><Clock className="text-brand-primary" size={20} /></div>
                                <h2 className="text-lg font-black uppercase font-outfit tracking-tighter">Meeting Details</h2>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-800 rounded-md transition-all text-slate-500 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Meeting Title</p>
                                <h3 className="text-xl font-black text-white font-outfit uppercase">{currentMeeting.title}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Student Name</p><p className="text-sm font-black text-brand-primary uppercase">{currentMeeting.studentId?.firstName} {currentMeeting.studentId?.lastName}</p></div>
                                <div className="space-y-2"><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Time Slot</p><p className="text-sm font-black text-white uppercase font-mono italic">{new Date(currentMeeting.date).toLocaleDateString('en-IN')} | {currentMeeting.startTime} - {currentMeeting.endTime}</p></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes</p>
                                <div className="bg-slate-950 p-6 rounded-md border border-slate-800 italic text-[11px] text-slate-400 font-medium leading-relaxed">{currentMeeting.description || 'No notes available.'}</div>
                            </div>
                            {(currentMeeting.meetingType === 'Online' || currentMeeting.meetingType === 'Virtual') && (
                                <button onClick={() => handleJoinLink(currentMeeting.meetingLink)} className="w-full bg-teacher-primary/10 hover:bg-teacher-primary/20 text-teacher-primary py-4 rounded-md font-black uppercase text-[10px] tracking-widest border border-teacher-primary/20 transition-all flex items-center justify-center gap-3">
                                    <Video size={16} />Join Online Meeting
                                </button>
                            )}
                            {currentMeeting.status === 'Scheduled' && (
                                <button onClick={() => { handleComplete(currentMeeting._id); setIsDetailOpen(false); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-4 rounded-md font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">
                                    <CheckCircle2 size={16} />Complete Meeting
                                </button>
                            )}
                        </div>
                    </>
                )}
            </PortalModal>
        </div>
    );
};

export default PTMMeetings;
