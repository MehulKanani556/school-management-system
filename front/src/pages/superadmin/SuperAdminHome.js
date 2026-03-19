import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../redux/slice/school.slice';
import { School, Activity, Settings, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminHome = () => {
    const dispatch = useDispatch();
    const { stats } = useSelector((state) => state.school);

    useEffect(() => {
        dispatch(fetchStats());
    }, [dispatch]);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter">Global Control Center</h1>
                    <p className="text-xs xs:text-sm font-medium text-slate-400 mt-1 tracking-wide">Infrastructure and situational awareness monitoring cluster.</p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-3 text-[10px] xs:text-xs font-bold text-brand-primary uppercase tracking-widest italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                    Monitoring Synchronized
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xs:gap-8">
                {[
                    { label: 'Institutional Nodes', value: stats.totalSchools, icon: School, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', trend: `${stats.activeSchools} Active` },
                    { label: 'Aggregate Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: Activity, color: 'text-luxury-emerald bg-luxury-emerald/10 border-luxury-emerald/20', trend: 'Live Stream' },
                    { label: 'Infrastructure Load', value: 'Optimized', icon: Settings, color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20', trend: 'Normal Perf' },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 xs:p-8 rounded-lg bg-brand-surface border border-brand-border shadow-2xl group hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6 font-bold uppercase tracking-widest text-[9px] xs:text-[10px] text-slate-500 italic">{stat.label} <span className="text-brand-accent/60">{stat.trend}</span></div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl xs:text-4xl font-bold tracking-tight font-inter text-slate-100 mb-1 uppercase italic">{stat.value}</h3>
                            <div className={`p-2.5 xs:p-3 rounded-lg border ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md600:grid-cols-2 gap-6 xs:gap-8">
                <div className="bg-brand-surface border border-brand-border border-dashed rounded-lg p-8 xs:p-10 h-[340px] xs:h-[380px] flex items-center justify-center group relative cursor-default hover:bg-brand-primary/5 transition-colors">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="text-center group-hover:scale-[1.02] transition-transform duration-700 p-4">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 rounded-full bg-slate-800/50 border border-brand-border flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-primary/10 transition-colors">
                            <Activity size={24} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <p className="text-[10px] xs:text-xs font-bold text-slate-200 uppercase tracking-widest font-outfit mb-2">Telemetry Visualization</p>
                        <p className="text-[10px] xs:text-[11px] font-medium text-slate-500 italic tracking-wide">Institutional data synchronization in progress...</p>
                    </div>
                </div>
                <div className="bg-brand-surface border border-brand-border border-dashed rounded-lg p-8 xs:p-10 h-[340px] xs:h-[380px] flex items-center justify-center group relative cursor-default hover:bg-brand-primary/5 transition-colors">
                    <div className="absolute top-6 right-6 text-slate-600 group-hover:text-brand-primary transition-colors duration-500"><ArrowUpRight size={18} /></div>
                    <div className="text-center group-hover:scale-[1.02] transition-transform duration-700 p-4">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 rounded-full bg-slate-800/50 border border-brand-border flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-primary/10 transition-colors">
                            <Users size={24} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <p className="text-[10px] xs:text-xs font-bold text-slate-200 uppercase tracking-widest font-outfit mb-2">Global Access Audit Feed</p>
                        <p className="text-[10px] xs:text-[11px] font-medium text-slate-500 italic tracking-wide">Monitoring real-time infrastructure interaction.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminHome;
