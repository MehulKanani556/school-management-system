import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSecurityOverview, fetchAuditLogs, clearStatus } from '../../redux/slice/superAdmin.slice';
import { ShieldCheck, AlertTriangle, ShieldOff, Activity, User, History, Terminal, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import toast from 'react-hot-toast';

const Security = () => {
    const dispatch = useDispatch();
    const { security, auditLogs, logsPagination, loading, error } = useSelector((state) => state.superAdmin);
    const [activeTab, setActiveTab] = useState('registry');
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchSecurityOverview());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'logs') {
            dispatch(fetchAuditLogs({ page, limit: 20 }));
        }
    }, [activeTab, page, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
        }
    }, [error, dispatch]);

    if (!security || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] opacity-30 grayscale animate-pulse">
                <ShieldCheck size={64} className="mb-6" />
                <h2 className="text-xl font-black uppercase italic tracking-widest text-slate-500">Scanning Firewall Matrix...</h2>
            </div>
        );
    }

    const { stats, recentAudits } = security;
    const displayLogs = activeTab === 'registry' ? recentAudits : auditLogs;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8 pb-10 font-outfit"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col text-left">
                    <h1 className="text-2xl xs:text-3xl font-black tracking-tight text-white font-inter italic uppercase leading-none mb-1.5">Security & Access Center</h1>
                    <p className="text-[11px] xs:text-sm font-medium text-slate-500 mt-1 tracking-wide flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                        Firewall Situational Monitoring Active. Threat level: <span className="text-emerald-500 font-black italic">LOW</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-md border border-white/5 h-12 shadow-2xl backdrop-blur-md">
                    <button 
                        onClick={() => setActiveTab('registry')}
                        className={`px-6 h-full rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'registry' ? 'bg-superadmin-primary text-black shadow-lg shadow-superadmin-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Registry Scan
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-6 h-full rounded-md text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'logs' ? 'bg-superadmin-primary text-black shadow-lg shadow-superadmin-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Audit Sequence
                    </button>
                </div>
            </div>

            {/* Security Alerts / Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Logs', value: stats.totalLogs, icon: History, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', note: 'Global Trace Matrix' },
                    { label: 'Security Alerts', value: stats.criticalAlerts, icon: AlertTriangle, color: 'text-superadmin-primary bg-superadmin-primary/10 border-superadmin-primary/20', note: 'Critical Anomalies' },
                    { label: 'Failed Access', value: stats.failedAttempts, icon: ShieldOff, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', note: 'Credential Faults' },
                    { label: 'Cluster Sync', value: '100%', icon: Globe, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', note: 'Global Nodes Active' }
                ].map((s, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl group hover:border-superadmin-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-md border ${s.color} transition-all duration-500 group-hover:scale-110`}>
                                <s.icon size={20} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-700 tracking-widest italic">Telemetry Scan</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-1.5 italic uppercase font-outfit">{s.value}</h3>
                        <p className="text-sm font-bold text-slate-200 tracking-tight mb-2 uppercase italic">{s.label}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic leading-none">{s.note}</p>
                    </div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/30 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden backdrop-blur-3xl group min-h-[500px] flex flex-col">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tight text-white leading-none font-inter">{activeTab === 'registry' ? 'High-Priority Audit Sequence' : 'Full Continuous Audit Stream'}</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60">Listing platform infrastructure operational changes.</p>
                    </div>
                    {activeTab === 'logs' && logsPagination && (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase italic tracking-widest">SEQ-P.{page} / {logsPagination.pages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(logsPagination.pages, p + 1))}
                                disabled={page === logsPagination.pages}
                                className="p-2 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Identity</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Protocol Action</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Node Zone</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right italic">Temporal Mark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayLogs.map((log, i) => (
                                <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md border border-white/5 bg-slate-800 overflow-hidden flex items-center justify-center p-0.5 group-hover/row:border-superadmin-primary/40 transition-all shrink-0">
                                                <User size={18} className="text-slate-600 group-hover/row:text-superadmin-primary transition-colors" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-[11px] text-white tracking-tighter group-hover/row:text-superadmin-primary transition-colors leading-none uppercase italic mb-1.5 truncate">{log.userId?.firstName || 'UNKNOWN'} {log.userId?.lastName || ''}</span>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic truncate">{log.userId?.role?.replace('_', ' ') || 'CORE_PROCESS'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Terminal size={12} className={log.action.includes('delete') || log.action.includes('error') ? 'text-superadmin-primary' : 'text-white/40'} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest italic truncate max-w-[200px] ${log.action.includes('delete') || log.action.includes('error') ? 'text-superadmin-primary' : 'text-slate-400'}`}>{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-800 border border-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest rounded-md italic">{log.module || 'SYSTEM'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter leading-none mb-1">{moment(log.createdAt).format('YYYY.MM.DD HH:mm:ss')}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic leading-none">{moment(log.createdAt).fromNow()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(displayLogs.length === 0) && (
                        <div className="p-20 text-center flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 transition-all flex-1">
                             <Activity size={48} className="mb-4 text-slate-700" />
                             <h4 className="text-lg font-black uppercase italic tracking-widest text-slate-500">No Registry Data</h4>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Security;
