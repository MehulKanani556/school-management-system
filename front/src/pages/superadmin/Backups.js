import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBackups, triggerBackup, clearStatus } from '../../redux/slice/superAdmin.slice';
import { Database, Shield, Download, RefreshCw, HardDrive, Lock, FileText, Terminal, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../utils/BASE_URL';

const Backups = () => {
    const dispatch = useDispatch();
    const { backups, loading, error, success } = useSelector((state) => state.superAdmin);
    const [isTriggering, setIsTriggering] = useState(false);
    const [copiedCommandId, setCopiedCommandId] = useState(null);

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

    const handleDownload = async (backup) => {
        if (!backup?.downloadUrl) {
            return toast.error('Simulation mode — no downloadable archive file');
        }
        const origin = BASE_URL.replace(/\/api\/?$/, '');
        const url = backup.downloadUrl.startsWith('http') ? backup.downloadUrl : `${origin}${backup.downloadUrl}`;
        
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = backup.downloadUrl.split('/').pop() || 'backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            toast.success('Download started successfully!');
        } catch (err) {
            console.error('Direct download failed, falling back to new tab:', err);
            window.open(url, '_blank');
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedCommandId(id);
        toast.success('Restore command copied to clipboard!');
        setTimeout(() => setCopiedCommandId(null), 2000);
    };

    const totalStorageMB = (Array.isArray(backups) ? backups.reduce((acc, curr) => acc + (curr.fileSizeMB || 0), 0) : 0);
    const storageDisplay = totalStorageMB > 1024 ? `${(totalStorageMB / 1024).toFixed(2)} GB` : `${totalStorageMB.toFixed(2)} MB`;
    const lastBackupTime = Array.isArray(backups) && backups.length > 0 ? moment(backups[0].createdAt).fromNow() : 'NEVER';

    const relayedCount = Array.isArray(backups) ? backups.filter((b) => b.status === 'Relayed').length : 0;
    const stats = [
        { label: 'Recorded Archives', value: String(Array.isArray(backups) ? backups.length : 0), icon: HardDrive, note: `Last run: ${lastBackupTime}`, color: 'text-superadmin-primary bg-superadmin-primary/10 border-superadmin-primary/20', tag: 'Dumps' },
        { label: 'Completed Runs', value: String(relayedCount), icon: Shield, note: 'Platform backup active', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', tag: 'Runs' },
        { label: 'Storage Tracked', value: storageDisplay, icon: Lock, note: 'Real JSON archive exports', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', tag: 'Volume' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-inter">Backups & Disaster Recovery</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-70">Generates full database JSON snapshots under uploads/backups for disaster recovery.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        disabled={loading || isTriggering}
                        onClick={() => handleTrigger('Full')}
                        className="h-12 px-6 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-3 shadow-xl shadow-superadmin-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group border border-superadmin-primary/40"
                    >
                        {isTriggering ? <RefreshCw className="animate-spin text-black" size={16} /> : <Database size={16} className="group-hover:rotate-12 transition-transform text-black" /> }
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Execute Full System Archive</span>
                    </button>
                    <button 
                        disabled={loading || isTriggering}
                        onClick={() => handleTrigger('System_Config')}
                        className="h-12 px-6 bg-white/5 border border-white/10 text-white rounded-md flex items-center justify-center gap-3 hover:bg-white/[0.08] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group"
                    >
                        <Shield size={16} className="text-slate-500 group-hover:text-superadmin-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors leading-none">Backup SysConfig Only</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-md backdrop-blur-3xl group hover:border-superadmin-primary/40 transition-all duration-300 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-superadmin-primary/20 to-transparent group-hover:via-superadmin-primary/50 transition-all duration-300"></div>
                        
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.tag}</span>
                                <h4 className="text-3xl font-black text-white tracking-tighter leading-none font-inter">{s.value}</h4>
                                <div>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">{s.label}</p>
                                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-1 truncate">{s.note}</p>
                                </div>
                            </div>
                            <div className={`p-3.5 rounded-md border transition-all duration-300 ${s.color} group-hover:scale-110`}>
                                <s.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-white font-inter">Archival Sequence Registry</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Listing historical institutional snapshot cycles.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-superadmin-primary uppercase bg-superadmin-primary/10 border border-superadmin-primary/20 px-3 py-1 rounded-md tracking-wider">Auto-Retention: 30 Days</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Snapshot ID</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Temporal Stamp</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Node Vector</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Density</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Integrity Action</th>
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
                                                <p className="text-xs font-black text-slate-100 uppercase tracking-tighter truncate group-hover:text-superadmin-primary transition-colors">SA-BKUP-{b._id.substring(18).toUpperCase()}</p>
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
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter leading-none mb-1">{moment(b.createdAt).format('YYYY.MM.DD HH:mm')}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{moment(b.createdAt).fromNow()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-md bg-superadmin-primary animate-pulse"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{b.service || 'System Node'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">{b.fileSizeMB ? `${b.fileSizeMB} MB` : 'CALCULATING...'}</span>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest truncate max-w-[150px]">{b.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {b.status === 'Relayed' && (
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-all">
                                                {b.downloadUrl && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleCopy(b._id, `node restore_db.js uploads/backups/backup-${b._id}.json`)}
                                                        className="h-8 w-8 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-superadmin-primary rounded-md flex items-center justify-center transition-all border border-white/5 hover:border-superadmin-primary/30"
                                                        title="Copy Restore Command"
                                                    >
                                                        {copiedCommandId === b._id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                                    </button>
                                                )}
                                                {b.downloadUrl ? (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDownload(b)}
                                                        className="h-8 px-4 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-superadmin-primary/10"
                                                    >
                                                        <Download size={13} />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">Download</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md tracking-wider">Simulated</span>
                                                )}
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
                        <h4 className="text-xl font-black uppercase tracking-widest text-slate-500">Archive Sequence Depleted</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs mx-auto leading-relaxed">System-wide archival logs are empty. Initiate a full system archive to begin redundancy protocol.</p>
                    </div>
                )}
            </div>

            <div className="bg-slate-900/30 border border-slate-800/60 rounded-md backdrop-blur-3xl p-8 shadow-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <div className="p-3 rounded-md bg-superadmin-primary/10 border border-superadmin-primary/20 text-superadmin-primary">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none font-inter">Database Restoration Protocol</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 opacity-60">Restore JSON snapshots directly into MongoDB collections</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold text-slate-300">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-superadmin-primary/10 border border-superadmin-primary/25 text-[10px] font-black text-superadmin-primary mt-0.5 shrink-0">1</span>
                            <div>
                                <h4 className="text-white uppercase tracking-wider text-[11px] mb-1 font-inter">Standard JSON Snapshot</h4>
                                <p className="text-slate-400 font-normal leading-relaxed text-[11px]">
                                    The system generates a standard JSON database dump representing all records. No need for a <code className="text-superadmin-primary bg-superadmin-primary/5 px-1 py-0.5 rounded font-mono font-bold">.gzip</code> or binary format.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-superadmin-primary/10 border border-superadmin-primary/25 text-[10px] font-black text-superadmin-primary mt-0.5 shrink-0">2</span>
                            <div>
                                <h4 className="text-white uppercase tracking-wider text-[11px] mb-1 font-inter">Download Archive</h4>
                                <p className="text-slate-400 font-normal leading-relaxed text-[11px]">
                                    Click <strong className="text-white">Download</strong> to save the JSON file locally, or locate it directly on the host machine inside the server's <code className="text-sky-400 bg-sky-500/5 px-1 py-0.5 rounded font-mono">back/uploads/backups/</code> directory.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-superadmin-primary/10 border border-superadmin-primary/25 text-[10px] font-black text-superadmin-primary mt-0.5 shrink-0">3</span>
                            <div>
                                <h4 className="text-white uppercase tracking-wider text-[11px] mb-1 font-inter">Execute Restore Script</h4>
                                <p className="text-slate-400 font-normal leading-relaxed text-[11px]">
                                    Run the Node.js restoration utility directly on the server to wipe existing collections and restore the JSON file:
                                </p>
                                <div className="mt-3 p-3 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-slate-300 relative group overflow-hidden flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase tracking-wider mb-1">
                                            <span>Terminal Command</span>
                                            <span className="text-superadmin-primary">back directory</span>
                                        </div>
                                        <span className="text-superadmin-primary select-all">node restore_db.js uploads/backups/backup-&lt;ID&gt;.json</span>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleCopy('template', 'node restore_db.js uploads/backups/backup-<ID>.json')}
                                        className="h-8 w-8 bg-slate-800/80 hover:bg-slate-700 hover:text-superadmin-primary rounded-md flex items-center justify-center transition-all border border-white/5 shrink-0 ml-3"
                                        title="Copy Template Command"
                                    >
                                        {copiedCommandId === 'template' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Backups;
