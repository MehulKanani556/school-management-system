import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlatformAnalytics, fetchAuditLogs } from '../../redux/slice/superAdmin.slice';
import { School, Activity, Settings, Users, ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import moment from 'moment';

const SuperAdminHome = () => {
    const dispatch = useDispatch();
    const { analytics, auditLogs, loading } = useSelector((state) => state.superAdmin);

    useEffect(() => {
        dispatch(fetchPlatformAnalytics());
        dispatch(fetchAuditLogs({ limit: 5 }));
    }, [dispatch]);

    const stats = [
        { 
            label: 'Institutional Nodes', 
            value: analytics?.infrastructure?.totalSchools || 0, 
            icon: School, 
            color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', 
            trend: `${analytics?.infrastructure?.activeSchools || 0} Active` 
        },
        { 
            label: 'Aggregate Revenue', 
            value: `$${(analytics?.revenue?.total || 0).toLocaleString()}`, 
            icon: Activity, 
            color: 'text-luxury-emerald bg-luxury-emerald/10 border-luxury-emerald/20', 
            trend: 'Live Stream' 
        },
        { 
            label: 'Citizen Census', 
            value: (analytics?.users?.total || 0).toLocaleString(), 
            icon: Users, 
            color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', 
            trend: `${analytics?.users?.active || 0} Active` 
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-10 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter">Global Control Center</h1>
                    <p className="text-xs xs:text-sm font-medium text-slate-400 mt-1 tracking-wide">Infrastructure and situational awareness monitoring cluster.</p>
                </div>
                <div className="px-4 py-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-3 text-[10px] xs:text-xs font-bold text-brand-primary uppercase tracking-widest italic">
                    <span className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                    Monitoring Synchronized
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xs:gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="p-6 xs:p-8 rounded-md bg-brand-surface border border-brand-border shadow-2xl group hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 font-bold uppercase tracking-widest text-[9px] xs:text-[10px] text-slate-500 italic">{stat.label} <span className="text-brand-accent/60">{stat.trend}</span></div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl xs:text-4xl font-bold tracking-tight font-inter text-slate-100 mb-1 uppercase italic">{stat.value}</h3>
                            <div className={`p-2.5 xs:p-3 rounded-md border ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md600:grid-cols-2 gap-6 xs:gap-8">
                <Link to="/superadmin/analytics" className="bg-brand-surface border border-brand-border rounded-md p-8 xs:p-10 min-h-[340px] flex flex-col group relative hover:bg-brand-primary/5 transition-colors overflow-hidden">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="mb-8">
                        <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em] italic mb-1">Telemetry Visualization</h4>
                        <p className="text-[10px] font-medium text-slate-500 italic">Institutional data synchronization in progress...</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${30 + (i * 20)}%` }}
                                    transition={{ duration: 1, delay: i * 0.2 }}
                                    className="h-full bg-brand-primary/40 rounded-full"
                                />
                            </div>
                        ))}
                        <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest mt-2">View Detailed Analytics</p>
                    </div>
                </Link>

                <Link to="/superadmin/security" className="bg-brand-surface border border-brand-border rounded-md p-8 xs:p-10 min-h-[340px] flex flex-col group relative hover:bg-brand-primary/5 transition-colors overflow-hidden">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.2em] italic mb-1">Global Access Audit Feed</h4>
                        <p className="text-[10px] font-medium text-slate-500 italic tracking-wide">Monitoring real-time infrastructure interaction.</p>
                    </div>
                    
                    <div className="space-y-4">
                        {auditLogs.length > 0 ? auditLogs.slice(0, 3).map((log, i) => (
                            <div key={i} className="flex items-start gap-3 pb-3 border-b border-brand-border/30 last:border-0">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-brand-primary flex-shrink-0">
                                    <Terminal size={14} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-slate-200 uppercase truncate">@{log.userId?.firstName} {log.userId?.lastName}</span>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase whitespace-nowrap">{moment(log.createdAt).fromNow()}</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-slate-500 italic truncate uppercase">{log.action}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-[9px] font-medium text-slate-500 italic">No recent activity logs.</p>
                        )}
                    </div>
                    <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest mt-auto">Open Security Center</p>
                </Link>
            </div>
        </motion.div>
    );
};

export default SuperAdminHome;
