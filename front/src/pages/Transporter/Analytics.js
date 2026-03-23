import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransportAnalyticsSlice } from '../../redux/slice/transport.slice';
import { BarChart3, PieChart, TrendingUp, Activity, Bus, User, Navigation, ShieldCheck, Timer, Wrench, Wallet, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
    const dispatch = useDispatch();
    const { analytics, loading } = useSelector((state) => state.transport);

    useEffect(() => {
        dispatch(fetchTransportAnalyticsSlice());
    }, [dispatch]);

    if (!analytics && loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Activity size={40} className="text-violet-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Synthesizing Logistics Intelligence...</p>
                </div>
            </div>
        );
    }

    const { fleet, operators, logistics, efficiency } = analytics || {
        fleet: { total: 0, active: 0, maintenance: 0, totalMaintenanceCost: 0 },
        operators: { total: 0, avgRating: 0 },
        logistics: { totalStudents: 0, assigned: 0, unassigned: 0 },
        efficiency: { delayRate: 0 }
    };

    const stats = [
        { label: 'Cumulative Maintenance', value: `₹${fleet.totalMaintenanceCost.toLocaleString()}`, icon: Wallet, color: 'text-rose-500', trend: 'Finance Vector' },
        { label: 'Fleet Utility', value: `${fleet.active}/${fleet.total}`, icon: Bus, color: 'text-violet-500', trend: 'Operational Ready' },
        { label: 'Operator Index', value: `${operators.avgRating}/5`, icon: User, color: 'text-sky-500', trend: 'Performance Metric' },
        { label: 'System Delay Rate', value: `${efficiency.delayRate}%`, icon: Timer, color: 'text-amber-500', trend: 'Efficiency Delta' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20 font-outfit">
            <div className="px-2">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-violet-500">Logistics Analytics</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Intelligence dashboard for high-frequency transport operations.</p>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-neutral-900 border border-slate-800/60 p-6 rounded-md shadow-2xl group hover:border-violet-600/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-md bg-neutral-950 border border-slate-800 ${stat.color} group-hover:border-violet-600/40 transition-all`}>
                                <stat.icon size={18} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">{stat.trend}</span>
                        </div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-2xl font-black text-slate-100 italic tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Fleet Health Matrix */}
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-violet-600/10 text-violet-500"><Wrench size={16} /></div>
                            <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-widest">Fleet Composition Matrix</h3>
                        </div>
                        <ShieldCheck size={16} className="text-emerald-500" />
                    </div>
                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                    <span>Active Deployment</span>
                                    <span>{((fleet.active / fleet.total) * 100 || 0).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-slate-800">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(fleet.active / fleet.total) * 100 || 0}%` }} className="h-full bg-violet-600 shadow-xl shadow-violet-600/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                    <span>Maintenance Downtime</span>
                                    <span>{((fleet.maintenance / fleet.total) * 100 || 0).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-slate-800">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(fleet.maintenance / fleet.total) * 100 || 0}%` }} className="h-full bg-rose-600 shadow-xl shadow-rose-600/20" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-md bg-neutral-950 border border-slate-800/60">
                                <p className="text-[9px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">Available Units</p>
                                <p className="text-xl font-black text-slate-100 italic">{fleet.active}</p>
                            </div>
                            <div className="p-4 rounded-md bg-neutral-950 border border-slate-800/60">
                                <p className="text-[9px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">In Service Bay</p>
                                <p className="text-xl font-black text-slate-100 italic">{fleet.maintenance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrollment Distribution */}
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-sky-600/10 text-sky-500"><Users size={16} /></div>
                            <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-widest">Entity Displacement Analysis</h3>
                        </div>
                        <TrendingUp size={16} className="text-sky-500" />
                    </div>
                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative w-40 h-40 mb-10">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-950 border border-slate-800" />
                                    <motion.circle 
                                        cx="80" cy="80" r="70" 
                                        stroke="currentColor" strokeWidth="12" 
                                        fill="transparent" 
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 - (440 * (logistics.assigned / logistics.totalStudents || 0)) }}
                                        className="text-sky-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black italic text-slate-100">{((logistics.assigned / logistics.totalStudents) * 100 || 0).toFixed(0)}%</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Coverage</span>
                                </div>
                            </div>
                            
                            <div className="w-full grid grid-cols-2 gap-8 px-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-sky-500" />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">Assigned</p>
                                        <p className="text-lg font-black text-slate-100 italic">{logistics.assigned} Entities</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">Standby (Non-Transport)</p>
                                        <p className="text-lg font-black text-slate-100 italic">{logistics.unassigned} Entities</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-amber-500">
                        <Navigation size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-100 uppercase italic tracking-tighter leading-none mb-1">Operational Sequence Report</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">Analysis of the last 10 finalized transit sequences across the Mobility Matrix.</p>
                    </div>
                </div>
                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase italic mb-1 tracking-widest">Sequence Success</p>
                        <p className="text-2xl font-black text-emerald-500 italic">100%</p>
                    </div>
                    <div className="text-right border-l border-slate-800/60 pl-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase italic mb-1 tracking-widest">Delay Delta</p>
                        <p className="text-2xl font-black text-rose-500 italic">{efficiency.delayRate}%</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
