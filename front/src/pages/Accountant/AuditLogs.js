import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Shield, Clock, User, Info, Search, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [moduleFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/accountant/audit-logs', { params: { module: moduleFilter } });
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl xs:text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-2">Security Audit Ledger</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Immutable record of platform administrative actions.</p>
                        <span className="h-px w-8 bg-brand-primary/30"></span>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest italic">{logs.length} Operations Synchronized</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchLogs} className="px-4 py-2 bg-brand-background border border-brand-border rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest italic hover:text-brand-primary transition-all">
                        Refresh Stream
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-brand-surface/40 p-4 rounded-md border border-brand-border/40 backdrop-blur-sm shadow-xl">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search operation hashes or identities..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-background border border-brand-border rounded-lg py-3 pl-10 pr-4 text-[11px] font-black text-slate-200 outline-none focus:border-brand-primary transition-all uppercase tracking-tighter" 
                    />
                </div>
                <select 
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="bg-brand-background border border-brand-border rounded-lg py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic outline-none focus:border-brand-primary appearance-none"
                >
                    <option value="">All Module Sectors</option>
                    <option value="Finance">Finance Protocol</option>
                    <option value="Admin">Admin Node</option>
                    <option value="Academic">Academic Layer</option>
                </select>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-brand-background/50">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Timestamp</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Operator Identity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Protocol Action</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border">Operational Details</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none border-b border-brand-border text-center">Module</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Clock className="animate-spin text-brand-primary" size={24} /><span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Synchronizing Ledger...</span></div></td>
                                </tr>
                            ) : filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-300">{moment(log.createdAt).format('YYYY-MM-DD')}</span>
                                            <span className="text-[9px] text-slate-500 font-mono">{moment(log.createdAt).format('HH:mm:ss')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-brand-primary border border-brand-border"><User size={14} /></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{log.userId?.firstName} {log.userId?.lastName}</span>
                                                <span className="text-[9px] text-slate-500 uppercase tracking-widest italic">{log.userId?.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded text-[9px] font-black uppercase tracking-widest">{log.action}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] text-slate-400 italic max-w-sm truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">{log.details}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase italic opacity-60">{log.module}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic opacity-60 font-black uppercase text-xs tracking-widest">No audit signals detected in this sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AuditLogs;
