import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { fetchVehicles, fetchRoutesSlice, fetchTransportAnalyticsSlice } from '../../redux/slice/transport.slice';
import { Bus, Navigation, Users, MapPin, Loader2, Activity, Wrench, Wallet, Star, Fuel, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

const TransporterDashboard = () => {
    const dispatch = useDispatch();
    const { vehicles, routes, analytics, loading } = useSelector((state) => state.transport);

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchRoutesSlice());
        dispatch(fetchTransportAnalyticsSlice());
    }, [dispatch]);

    const stats = [
        { label: 'Active Fleet', value: vehicles.length, icon: Bus, color: 'text-orange-400', sub: `${vehicles.filter(v => v.status === 'active').length} Operational` },
        { label: 'Calculated Routes', value: routes.length, icon: Navigation, color: 'text-blue-400', sub: `${routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0)} Logistical Nodes` },
        { label: 'Assigned Entities', value: routes.reduce((acc, r) => acc + (r.assignedStudents?.length || 0), 0), icon: Users, color: 'text-emerald-400', sub: 'Student Assignment' },
        { label: 'Sequence Delay', value: analytics ? `${analytics.efficiency.delayRate}%` : '0%', icon: Activity, color: 'text-rose-400', sub: 'Efficiency Delta' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none">Logistics Matrix</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Real-time institutional mobility visualization.</p>
                </div>
                {loading && <Loader2 size={16} className="text-violet-500 animate-spin mb-2" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-slate-800/60 p-8 rounded-md relative overflow-hidden group hover:border-violet-600/30 transition-all duration-300 shadow-2xl font-outfit">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-md bg-neutral-950/60 border border-slate-800/60 ${stat.color} group-hover:border-violet-600/40 transition-all`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 italic uppercase mb-2 tracking-tighter leading-none">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none opacity-60 mb-2">{stat.label}</p>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] italic leading-none">{stat.sub}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 bg-neutral-900 border border-slate-800/60 rounded-md p-10 relative group overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex flex-col sm:flex-row items-center gap-10">
                         <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                            <Bus size={64} className="text-orange-600/20 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 border-2 border-slate-800/40 border-dashed rounded-full animate-[spin_20s_linear_infinite]"></div>
                         </div>
                         <div className="text-center sm:text-left">
                            <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-100 mb-2 font-outfit">Fleet Telemetry Active</h4>
                            <p className="text-[10px] font-bold text-slate-500 opacity-60 uppercase italic leading-loose max-w-lg mb-8">
                                Institutional nodes are synchronizing with calculated routes. Monitoring transit integrity and temporal efficiency across the mobility matrix.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                                <div className="px-4 py-3 bg-neutral-950 border border-slate-800 rounded flex items-center gap-3">
                                    <Wrench size={14} className="text-rose-500" />
                                    <div className="text-left font-outfit">
                                        <p className="text-[8px] font-black text-slate-600 uppercase italic leading-none mb-1">Service Queue</p>
                                        <p className="text-sm font-black text-slate-100 italic leading-none uppercase tracking-tighter">{analytics?.fleet.maintenance || 0} Units</p>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-neutral-950 border border-slate-800 rounded flex items-center gap-3">
                                    <Wallet size={14} className="text-emerald-500" />
                                    <div className="text-left font-outfit">
                                        <p className="text-[8px] font-black text-slate-600 uppercase italic leading-none mb-1">Maint. Index</p>
                                        <p className="text-sm font-black text-slate-100 italic leading-none uppercase tracking-tighter">₹{analytics?.fleet.totalMaintenanceCost.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl font-outfit">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-widest mb-8 flex items-center gap-2">
                        <Star size={14} className="text-orange-500" /> Operator Index
                    </h3>
                    <div className="space-y-6">
                        <div className="text-center py-6 bg-neutral-950 border border-slate-800 rounded-md">
                            <p className="text-5xl font-black text-orange-500 italic mb-2 tracking-tighter">{analytics?.operators.avgRating || 0}</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest opacity-60">Composite Fleet Rating</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-neutral-950 border border-slate-800 rounded-md">
                                <p className="text-[8px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">Total Operators</p>
                                <p className="text-sm font-black text-slate-100 italic uppercase">{analytics?.operators.total || 0}</p>
                             </div>
                             <div className="p-3 bg-neutral-950 border border-slate-800 rounded-md">
                                <p className="text-[8px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">Efficiency Index</p>
                                <p className="text-sm font-black text-slate-100 italic uppercase">OPTIMAL</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { to: '/transporter/tracking', label: 'Live Radar', icon: Navigation, desc: 'Real-time GPS nodes', color: 'bg-blue-600' },
                    { to: '/transporter/Maintenancetransport', label: 'Fuel Ledger', icon: Fuel, desc: 'Resource allocation logs', color: 'bg-orange-600' },
                    { to: '/transporter/announcements', label: 'Broadcaster', icon: Megaphone, desc: 'Sector-wide directives', color: 'bg-violet-600' },
                    { to: '/transporter/students', label: 'Bulk Link', icon: Users, desc: 'Mass entity assignment', color: 'bg-emerald-600' }
                ].map((action, idx) => (
                    <NavLink key={idx} to={action.to} className="group relative bg-neutral-900 border border-slate-800/60 p-1 rounded-md overflow-hidden hover:border-white/20 transition-all font-outfit h-32 flex">
                        <div className="bg-neutral-950/40 rounded-md p-6 flex items-center justify-between w-full h-full">
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-orange-500 transition-colors">{action.label}</h4>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">{action.desc}</p>
                            </div>
                            <div className={`p-4 rounded-md ${action.color} text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                <action.icon size={24} />
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>

        </motion.div>
    );
};

export default TransporterDashboard;
