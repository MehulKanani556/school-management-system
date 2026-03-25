import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildBehaviorLogs } from '../../redux/slice/parent.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Search, User, MessageSquare, Calendar, ChevronRight } from 'lucide-react';

const ChildBehavior = () => {
    const dispatch = useDispatch();
    const { selectedChild, behaviorLogs, behaviorLoading: loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildBehaviorLogs(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    const getStatusStyles = (type) => {
        switch (type) {
            case 'Positive': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'Negative': return 'bg-parent-primary/10 border-parent-primary/20 text-parent-primary';
            case 'Warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            default: return 'bg-slate-800/50 border-slate-700/50 text-slate-400';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f0f12] p-10 rounded-md border border-slate-800/60 backdrop-blur-3xl group shadow-2xl">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform shadow-lg shadow-brand-primary/5">
                            <Shield className="text-brand-primary" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight font-outfit text-white">Conduct <span className="text-brand-primary">Registry</span></h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1">Institutional Behavioral Vector Analysis</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 italic">Monitored Profile</span>
                    <div className="flex items-center gap-3 bg-slate-900/50 px-6 py-3 rounded-md border border-slate-800 shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-white">{selectedChild?.firstName} {selectedChild?.lastName}</span>
                    </div>
                </div>
            </div>

            {/* Behavioral Feed */}
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-primary/40 to-transparent"></div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Temporal Metadata logs</h2>
                </div>

                <div className="grid gap-6">
                    <AnimatePresence mode='popLayout'>
                        {behaviorLogs?.map((log, i) => (
                            <motion.div 
                                key={log._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-[#0f0f12] border border-slate-800/80 rounded-md p-8 hover:border-brand-primary/30 transition-all group relative overflow-hidden shadow-xl"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-md flex items-center justify-center border transition-all ${getStatusStyles(log.type)}`}>
                                            {log.type === 'Positive' ? <CheckCircle2 size={24} /> : log.type === 'Negative' ? <AlertTriangle size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-black uppercase font-outfit tracking-wide text-white group-hover:text-brand-primary transition-colors">{log.category}</h3>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${getStatusStyles(log.type)}`}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged by {log.teacherId?.firstName} {log.teacherId?.lastName} // Faculty Authority</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-950/40 border border-slate-800/40 p-6 rounded-md mb-6 shadow-inner">
                                    <p className="text-[12px] font-medium text-slate-400 italic leading-relaxed">
                                        "{log.description}"
                                    </p>
                                </div>

                                {log.actionTaken && (
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 transition-all group-hover:border-brand-primary/20">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Corrective Logic // Response Archive:</span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/5 px-4 py-1.5 rounded-md border border-emerald-500/10">{log.actionTaken}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {(!behaviorLogs || behaviorLogs.length === 0) && !loading && (
                        <div className="py-24 border-2 border-dashed border-slate-800/60 rounded-md text-center group hover:border-brand-primary/30 transition-all bg-slate-950/20 shadow-inner">
                            <Shield size={48} className="mx-auto text-slate-800 opacity-20 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-[0.3em] font-outfit mb-2">Registry Null</h3>
                            <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] italic">No significant behavioral vectors indexed in the current cycle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChildBehavior;
