import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, fetchRoutesSlice } from '../../redux/slice/transport.slice';
import { Bus, Navigation, Users, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TransporterDashboard = () => {
    const dispatch = useDispatch();
    const { vehicles, routes, loading } = useSelector((state) => state.transport);

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchRoutesSlice());
    }, [dispatch]);

    const stats = [
        { label: 'Active Fleet', value: vehicles.length, icon: Bus, color: 'text-orange-400' },
        { label: 'Calculated Routes', value: routes.length, icon: Navigation, color: 'text-blue-400' },
        { label: 'Assigned Entities', value: routes.reduce((acc, r) => acc + (r.assignedStudents?.length || 0), 0), icon: Users, color: 'text-emerald-400' },
        { label: 'Logistic Nodes', value: routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0), icon: MapPin, color: 'text-amber-400' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none">Logistics Matrix</h1>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Real-time institutional mobility visualization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 p-8 rounded-md border border-slate-800/60 relative overflow-hidden group hover:border-orange-600/30 transition-all duration-300 shadow-xl shadow-orange-950/5 font-outfit">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-md bg-neutral-950/60 border border-slate-800/60 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 italic uppercase mb-2 tracking-tighter leading-none">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>
            
            <div className="p-16 border border-slate-800/60 border-dashed rounded-md text-center bg-neutral-900/40 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Bus size={48} className="text-orange-600/20 mb-6 mx-auto group-hover:scale-110 transition-transform duration-500" />
                <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500 italic mb-4 font-outfit">Fleet Telemetry</h4>
                <p className="text-[10px] font-bold text-slate-500 opacity-60 uppercase italic leading-relaxed max-w-sm mx-auto">
                    Institutional nodes are synchronizing with calculated routes... <br/> Monitoring transit integrity and temporal efficiency.
                </p>
                <div className="mt-8 flex justify-center gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-600/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                </div>
            </div>
        </motion.div>
    );
};

export default TransporterDashboard;
