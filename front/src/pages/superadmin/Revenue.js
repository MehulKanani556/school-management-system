import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchools, fetchStats } from '../../redux/slice/school.slice';
import { DollarSign, TrendingUp, Globe, Activity, School } from 'lucide-react';
import { motion } from 'framer-motion';

const Revenue = () => {
    const dispatch = useDispatch();
    const { schools, stats, loading } = useSelector((state) => state.school);

    useEffect(() => {
        dispatch(fetchSchools());
        dispatch(fetchStats());
    }, [dispatch]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter italic uppercase leading-tight">Gross Revenue Stream</h1>
                    <p className="text-[11px] xs:text-sm font-medium text-slate-400 mt-1 tracking-wide flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                        Institutional fiscal telemetry active.
                    </p>
                </div>
                <div className="px-5 py-3 rounded-lg bg-luxury-emerald/10 border border-luxury-emerald/20 flex items-center gap-4 shadow-2xl group cursor-default transition-all hover:shadow-luxury-emerald/10">
                    <div className="w-10 h-10 rounded-lg bg-luxury-emerald flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-luxury-emerald/60 tracking-widest italic leading-none mb-1">Live Flow</p>
                        <p className="text-xl font-black text-luxury-emerald tracking-tighter leading-none font-outfit uppercase italic">${stats.totalRevenue?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Performance Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Cumulative Metric */}
                <div className="bg-brand-surface p-8 rounded-lg border border-brand-border shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 italic">Fiscal Hub Density</p>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-5xl font-black text-slate-100 tracking-tighter uppercase italic leading-none font-outfit">{stats.totalSchools}</span>
                            <span className="text-sm font-bold text-slate-400 italic mb-1 tracking-tight">Active Nodes</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400/80 leading-relaxed">Global educational instances contributing to the predictive revenue cluster.</p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 text-brand-primary/5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-1000">
                        <Globe size={130} />
                    </div>
                </div>

                {/* Performance Feed */}
                <div className="md:col-span-1 xl:col-span-2 bg-brand-surface p-8 rounded-lg border border-brand-border shadow-2xl overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic mb-1.5">Node Revenue Registry</p>
                            <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tight">Individual Performance Map</h3>
                        </div>
                        <div className="p-3 rounded-lg bg-brand-background text-slate-400 group-hover:text-brand-primary transition-all border border-brand-border">
                            <Activity size={20} />
                        </div>
                    </div>

                    <div className="overflow-x-auto pr-2">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-brand-border">
                                {schools.slice(0, 5).map((school, i) => (
                                    <tr key={i} className="group/row hover:bg-brand-background/40 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-slate-400 group-hover/row:border-brand-primary/40 transition-colors">
                                                    {school.logo ? <img src={school.logo} alt="" className="w-full h-full object-cover rounded-md" /> : <School size={16} />}
                                                </div>
                                                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover/row:text-brand-primary transition-colors">{school.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-sm font-black text-slate-100 tracking-tighter leading-none font-outfit uppercase italic">${school.revenue?.toLocaleString() || '0'}</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-luxury-emerald animate-pulse"></div>
                                                    <span className="text-[9px] font-black text-luxury-emerald uppercase tracking-widest italic">Operational</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Predictive Visual Section */}
            <div className="bg-brand-surface border border-brand-border border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center group hover:bg-brand-primary/5 transition-all">
                <div className="w-16 h-16 rounded-full bg-brand-background flex items-center justify-center mb-6 border border-brand-border group-hover:border-brand-accent transition-all duration-500 shadow-2xl">
                    <DollarSign size={24} className="text-slate-400 group-hover:text-brand-accent transition-colors" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-100 mb-2 font-inter">Predictive Flow Synchronization</h3>
                <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed italic tracking-wide">Infrastructure data mapping in progress. Global fiscal clusters are synchronizing with predictive algorithms.</p>
                <div className="mt-8 px-6 py-2.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black uppercase text-brand-primary tracking-widest italic shadow-xl group-hover:bg-brand-primary group-hover:text-white transition-all cursor-pointer">
                    Initiate Node Sync
                </div>
            </div>
        </motion.div>
    );
};

export default Revenue;
