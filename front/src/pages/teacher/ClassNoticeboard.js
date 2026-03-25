import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedClasses, fetchMyMessages, sendMessage } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Plus,
    Users,
    Send,
    Activity,
    Calendar,
    Pin,
    Search,
    Filter
} from 'lucide-react';

const ClassNoticeboard = () => {
    const dispatch = useDispatch();
    const { classes, messages, loading } = useSelector(state => state.teacher);
    const [selectedClass, setSelectedClass] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [noticeInput, setNoticeInput] = useState({ subject: '', content: '' });

    useEffect(() => {
        dispatch(fetchAssignedClasses());
        dispatch(fetchMyMessages());
    }, [dispatch]);

    const classNotices = messages.filter(m =>
        m.type === 'Announcement' &&
        (!selectedClass || m.classSection === selectedClass)
    );

    const handlePostNotice = (e) => {
        e.preventDefault();
        if (!selectedClass || !noticeInput.subject || !noticeInput.content) return;

        dispatch(sendMessage({
            type: 'Announcement',
            classSection: selectedClass,
            targetRole: 'Student', // Usually for students in that class
            ...noticeInput
        }));

        setShowPostModal(false);
        setNoticeInput({ subject: '', content: '' });
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-teacher-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-teacher-primary uppercase tracking-[0.45em] italic">Sector Bulletin</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Class Noticeboard</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic leading-relaxed">Cluster-specific archival transmissions and academic directives.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative group min-w-[200px]">
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 h-14 pl-14 pr-8 rounded-md text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:border-teacher-primary/40 transition-all text-white shadow-xl italic"
                        >
                            <option value="">All Sectors</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>Grade {c.standardId?.level || c.gradeLevel} - {c.sectionLabel}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="h-14 bg-teacher-primary hover:bg-teacher-primary text-white px-8 rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 italic"
                    >
                        <Plus size={18} /> Compose Protocol
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {classNotices.map((notice, idx) => (
                        <motion.div
                            key={notice._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-teacher-primary/20 transition-all"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teacher-primary/5 rounded-full blur-2xl group-hover:bg-teacher-primary/10 transition-all"></div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-teacher-primary/10 text-teacher-primary rounded-md border border-teacher-primary/20 shadow-xl">
                                    <Pin size={18} />
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Calendar size={12} /> {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter leading-none mb-4 group-hover:text-teacher-primary transition-colors uppercase">{notice.subject}</h3>
                            <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10 h-[60px] overflow-hidden uppercase tracking-tight">{notice.content}</p>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-700">
                                <span>Target: Academic Cluster</span>
                                <span className="text-teacher-primary/40 italic">Active Directive</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {classNotices.length === 0 && (
                    <div className="col-span-full py-40 text-center opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-8 animate-pulse text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">No Directives Transmitted</h3>
                    </div>
                )}
            </div>

            {showPostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-12 rounded-md shadow-[0_50px_150px_rgba(0,0,0,0.8)] max-w-2xl w-full relative">
                        <button onClick={() => setShowPostModal(false)} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-all"><Plus className="rotate-45" size={24} /></button>
                        <header className="mb-10">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter font-outfit mb-2">Protocol Composition</h2>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Awaiting sectoral parameters...</p>
                        </header>
                        <form onSubmit={handlePostNotice} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Subject Header</label>
                                <input
                                    type="text"
                                    placeholder="Enter directive nomenclature..."
                                    value={noticeInput.subject}
                                    onChange={(e) => setNoticeInput({ ...noticeInput, subject: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 h-14 px-8 rounded-md text-white text-sm font-bold outline-none focus:border-teacher-primary transition-all italic uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Transmitted Content</label>
                                <textarea
                                    placeholder="Compose institutional archival data..."
                                    value={noticeInput.content}
                                    onChange={(e) => setNoticeInput({ ...noticeInput, content: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 p-8 rounded-md text-white text-sm font-bold outline-none focus:border-teacher-primary transition-all italic resize-none h-[180px] uppercase"
                                />
                            </div>
                            <button type="submit" className="w-full h-16 bg-teacher-primary hover:bg-teacher-primary text-white rounded-md font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl italic">
                                <Send size={20} /> Initiate Archival Signal
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ClassNoticeboard;
