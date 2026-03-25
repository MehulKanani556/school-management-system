import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildMeetings } from '../../redux/slice/parent.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Video, MapPin, CheckCircle2, MoreVertical, MessageSquare, ChevronRight, LayoutGrid } from 'lucide-react';

const ChildMeetings = () => {
    const dispatch = useDispatch();
    const { selectedChild, meetings, meetingsLoading: loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildMeetings(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    const upcomingMeetings = meetings?.filter(m => new Date(m.date) >= new Date().setHours(0,0,0,0));
    const pastMeetings = meetings?.filter(m => new Date(m.date) < new Date().setHours(0,0,0,0));

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-[#0f0f12] p-12 rounded-md border border-slate-800/80 backdrop-blur-3xl shadow-2xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full -mr-40 -mt-40 blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border border-white/5 shadow-inner shadow-white/10 group-hover:scale-105 transition-all">
                        <Calendar className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-white mb-2 leading-none">PTM <span className="text-brand-primary">Protocols</span></h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Guardian Synchronization Dashboard</p>
                    </div>
                </div>

                <div className="relative z-10 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 italic">Active Cluster</p>
                    <div className="flex items-center gap-4 bg-slate-900/60 px-8 py-4 rounded-md border border-slate-800 shadow-inner group">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.6)] animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{selectedChild?.firstName}'s Academic Node</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Upcoming Meetings */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center gap-6 px-4">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white italic">Active Synchronizations</h2>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-primary/40 via-brand-secondary/20 to-transparent"></div>
                    </div>

                    <div className="grid gap-8">
                        <AnimatePresence mode='popLayout'>
                            {upcomingMeetings?.map((m, i) => (
                                <motion.div 
                                    key={m._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#0f0f12] border border-slate-800/80 rounded-md p-10 hover:border-brand-primary/40 transition-all group relative backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 rounded-md bg-slate-900 border-2 border-slate-800/60 flex flex-col items-center justify-center p-3 group-hover:border-brand-primary/30 transition-all shadow-inner">
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{new Date(m.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-3xl font-black text-white font-outfit">{new Date(m.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black uppercase font-outfit tracking-tighter mb-2 text-white group-hover:text-brand-primary transition-colors">{m.title}</h3>
                                                <div className="flex items-center gap-5">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-brand-primary" />
                                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{m.startTime} - {m.endTime}</span>
                                                    </div>
                                                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-slate-500" />
                                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Faculty: {m.teacherId?.firstName} {m.teacherId?.lastName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-8 py-3 rounded-md border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${
                                            m.meetingType === 'Virtual' ? 'bg-parent-primary/10 border-parent-primary/30 text-parent-primary shadow-parent-primary/5' : 'bg-slate-800/50 border-slate-700/60 text-slate-400 shadow-white/5'
                                        }`}>
                                            {m.meetingType === 'Virtual' ? <Video size={12} className="inline mr-3 -translate-y-[1px]" /> : <MapPin size={12} className="inline mr-3 -translate-y-[1px]" />}
                                            {m.meetingType} SECTOR
                                        </div>
                                    </div>

                                    {m.description && <p className="text-[13px] font-medium text-slate-400 italic mb-10 pl-6 border-l-3 border-brand-primary/20 leading-relaxed max-w-2xl">{m.description}</p>}

                                    <div className="flex items-center justify-between pt-8 border-t border-slate-800/80">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <CheckCircle2 size={16} className="text-emerald-500/50" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Protocol Status: {m.status}</span>
                                        </div>
                                        {m.meetingType === 'Virtual' ? (
                                            <button className="flex items-center gap-4 text-parent-primary hover:text-parent-primary text-[11px] font-black uppercase tracking-[0.3em] bg-cyan-900/10 hover:bg-cyan-900/20 px-10 py-4 rounded-md transition-all border border-parent-primary/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                                INITIALIZE SYNC
                                                <ChevronRight size={18} />
                                            </button>
                                        ) : (
                                            <button className="flex items-center gap-4 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] px-10 py-4 rounded-md transition-all border border-slate-800 hover:border-slate-700 bg-slate-900/40">
                                                DETAILED MANIFEST
                                                <ChevronRight size={18} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {(!upcomingMeetings || upcomingMeetings?.length === 0) && !loading && (
                            <div className="py-32 border-2 border-dashed border-slate-800/60 rounded-md text-center group hover:border-brand-primary/30 transition-all bg-slate-950/20">
                                <Users size={56} className="mx-auto text-slate-800 opacity-20 mb-8 group-hover:scale-110 transition-transform" />
                                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-[0.4em] font-outfit mb-3 italic">Quiescent Period</h3>
                                <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.3em] italic max-w-sm mx-auto">No upcoming pedagogical synchronizations detected in the current academic vector.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Historical Registry Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-slate-950/40 p-1.5 rounded-md border border-slate-800/60 overflow-hidden shadow-2xl">
                        <div className="p-10 space-y-10 bg-[#0f0f12]">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-6 flex items-center justify-between font-outfit italic">
                                Institutional Summary
                                <LayoutGrid size={16} className="text-brand-primary" />
                            </h3>
                            <div className="grid gap-6">
                                <div className="bg-slate-900/40 p-8 rounded-md border border-slate-800/80 group">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 group-hover:text-brand-primary transition-colors italic">Active</p>
                                    <p className="text-4xl font-black font-outfit text-white group-hover:scale-110 transition-transform origin-left">{upcomingMeetings?.length || 0}</p>
                                </div>
                                <div className="bg-slate-900/40 p-8 rounded-md border border-slate-800/80 group">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 group-hover:text-emerald-400 transition-colors italic">Archived</p>
                                    <p className="text-4xl font-black font-outfit text-white opacity-40 group-hover:opacity-100 transition-opacity origin-left">{pastMeetings?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Historical Registry</h2>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>
                        {pastMeetings?.slice(0, 4).map((m, i) => (
                            <motion.div 
                                key={m._id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-900/30 border border-slate-800/60 rounded-md p-8 border-l-4 border-slate-800 opacity-60 hover:opacity-100 hover:border-l-brand-primary/40 transition-all group shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{new Date(m.date).toLocaleDateString()}</span>
                                    <CheckCircle2 size={12} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h4 className="text-[13px] font-black uppercase tracking-tight text-white mb-2 group-hover:text-brand-primary transition-all font-outfit">{m.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Faculty Anchor: {m.teacherId?.firstName} {m.teacherId?.lastName}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChildMeetings;
