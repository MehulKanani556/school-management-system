import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyMessages } from '../../redux/slice/teacher.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, Activity, Pin } from 'lucide-react';

const TeacherAnnouncements = () => {
    const dispatch = useDispatch();
    const { messages = [], loading } = useSelector(state => state.teacher || {});
    const announcements = messages.filter(m => m.type === 'Announcement');

    useEffect(() => {
        dispatch(fetchMyMessages());
    }, [dispatch]);

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-teacher-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-teacher-primary uppercase tracking-[0.45em] italic">Terminal Bulletin</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Announcements</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic leading-relaxed">System-wide institutional archival transmissions.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 text-center opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-8 animate-pulse text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Retrieving Directives...</h3>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {announcements.map((announcement, idx) => (
                            <motion.div
                                key={announcement._id}
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
                                        <Calendar size={12} /> {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter leading-none mb-4 group-hover:text-teacher-primary transition-colors uppercase">{announcement.subject || announcement.title}</h3>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-6 overflow-hidden uppercase tracking-tight">{announcement.content}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && announcements.length === 0 && (
                    <div className="col-span-full py-40 text-center opacity-30 italic">
                        <Megaphone className="w-16 h-16 mx-auto mb-8 text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">No Active Announcements</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherAnnouncements;
