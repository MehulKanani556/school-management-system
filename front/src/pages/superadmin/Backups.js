import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBackups, triggerBackup, clearStatus } from '../../redux/slice/superAdmin.slice';
import { Database, Shield, Download, RefreshCw, HardDrive, Lock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import toast from 'react-hot-toast';

const Backups = () => {
    const dispatch = useDispatch();
    const { backups, loading, error, success } = useSelector((state) => state.superAdmin);
    const [isTriggering, setIsTriggering] = useState(false);

    useEffect(() => {
        dispatch(fetchBackups());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
            setIsTriggering(false);
        }
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
            setIsTriggering(false);
        }
    }, [success, error, dispatch]);

    const handleTrigger = (type = 'Full') => {
        setIsTriggering(true);
        dispatch(triggerBackup({ type }));
    };

    const handleDownload = (url) => {
        if (!url) return toast.error('DATA CLUSTER NOT READY');
        toast.success('DECRYPTION INITIATED');
        // In a real app we'd trigger a real download
        window.open(url, '_blank');
    };

    const totalStorageMB = (Array.isArray(backups) ? backups.reduce((acc, curr) => acc + (curr.fileSizeMB || 0), 0) : 0);
    const storageDisplay = totalStorageMB > 1024 ? `${(totalStorageMB / 1024).toFixed(2)} GB` : `${totalStorageMB} MB`;
    const lastBackupTime = Array.isArray(backups) && backups.length > 0 ? moment(backups[0].createdAt).fromNow() : 'NEVER';

    const stats = [
        { label: 'Aggregate Storage', value: storageDisplay, icon: HardDrive, note: `Last sync: ${lastBackupTime}`, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
        { label: 'Node Redundancy', value: '3/3 Clusters', icon: Shield, note: 'Mirror Sync Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Security Layer', value: 'SHA-256', icon: Lock, note: 'End-to-End Encrypted', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 font-inter">Backups & Disaster Recovery</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">Global institutional data archival & redundancy controller.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        disabled={loading || isTriggering}
                        onClick={() => handleTrigger('Full')}
                        className="h-14 px-8 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-4 shadow-xl shadow-superadmin-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group border border-superadmin-primary/40"
                    >
                        {isTriggering ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} className="group-hover:rotate-12 transition-transform" /> }
                        <span className="text-[10px] font-black uppercase italic tracking-widest leading-none">Execute Full System Archive</span>
                    </button>
                    <button 
                        disabled={loading || isTriggering}
                        onClick={() => handleTrigger('System_Config')}
                        className="h-14 px-8 bg-white/5 border border-white/10 text-white rounded-md flex items-center justify-center gap-4 hover:bg-white/[0.08] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group"
                    >
                        <Shield size={20} className="text-slate-500 group-hover:text-superadmin-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 group-hover:text-white transition-colors leading-none">Backup SysConfig Only</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl group hover:border-superadmin-primary/20 transition-all text-center">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-md border ${s.color}`}>
                                <s.icon size={24} />
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Telemetry Active</span>
                        </div>
                        <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1 leading-none">{s.value}</h4>
                        <p className="text-sm font-bold text-slate-400 italic mb-2 tracking-tight">{s.label}</p>
                        <p className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest leading-none truncate">{s.note}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none font-inter">Archival Sequence Logging</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60">Listing historical institutional snapshot cycles.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase italic opacity-70">Auto-Retention: 30 Days</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Snapshot ID</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Temporal Stamp</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Node Vector</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Snapshot Density</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-right">Integrity Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Array.isArray(backups) && backups.map((b, i) => (
                                <tr key={b._id} className="group hover:bg-white/[0.01] transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-white/5 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all shrink-0">
                                                <FileText size={16} className="text-slate-500 group-hover:text-superadmin-primary transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-100 italic uppercase tracking-tighter truncate group-hover:text-superadmin-primary transition-colors">SA-BKUP-{b._id.substring(18).toUpperCase()}</p>
                                                <div className="flex items-center gap-2 opacity-60">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest border ${
                                                        b.type === 'Full' ? 'bg-superadmin-primary/10 border-superadmin-primary/20 text-superadmin-primary' : 'bg-slate-800 border-white/5 text-slate-500'
                                                    }`}>
                                                        {b.type} SNAPSHOT
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-tighter leading-none mb-1">{moment(b.createdAt).format('YYYY.MM.DD HH:mm')}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">{moment(b.createdAt).fromNow()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic truncate">{b.service || 'System Node'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase italic leading-none mb-1">{b.fileSizeMB ? `${b.fileSizeMB} MB` : 'CALCULATING...'}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic truncate max-w-[150px]">{b.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {b.status === 'Relayed' && (
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleDownload(b.downloadUrl)}
                                                    className="h-10 px-4 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-superadmin-primary/20"
                                                >
                                                    <Download size={14} />
                                                    <span className="text-[9px] font-black uppercase italic tracking-widest">Download Node Archive</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!Array.isArray(backups) || backups.length === 0) && (
                    <div className="p-20 text-center flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 transition-all">
                        <Database size={64} className="mb-6 opacity-20" />
                        <h4 className="text-xl font-black uppercase italic tracking-widest text-slate-500">Archive Sequence Depleted</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs mx-auto italic leading-relaxed">System-wide archival logs are empty. Initiate a full system archive to begin redundancy protocol.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Backups;
