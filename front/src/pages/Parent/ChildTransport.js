import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildTransport } from '../../redux/slice/parent.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Clock, User, Shield, Navigation, AlertCircle, Phone, Info } from 'lucide-react';

const ChildTransport = () => {
    const dispatch = useDispatch();
    const { selectedChild, transport, transportLoading: loading } = useSelector((state) => state.parent);

    useEffect(() => {
        if (selectedChild?._id) {
            dispatch(fetchChildTransport(selectedChild._id));
        }
    }, [selectedChild?._id, dispatch]);

    if (loading && !transport) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-40 opacity-50 space-y-4">
                <div className="w-10 h-10 border-2 border-luxury-rose border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Uplinking to Fleet Management...</span>
            </div>
        );
    }

    if (!transport) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-md border-2 border-dashed border-slate-800 animate-spin-slow"></div>
                    <Truck size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase italic tracking-widest leading-none mb-4 font-outfit">No Active Fleet Link</h3>
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-[.2em] max-w-xs mx-auto leading-relaxed">This student is not currently indexed in the institutional transport grid.</p>
                </div>
            </div>
        );
    }

    const { route, assignment } = transport;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl group">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-emerald-400 rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Fleet Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit">Transport Logistics</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic">Route synchronization for <span className="text-white font-bold">{selectedChild?.firstName}</span>'s daily transit.</p>
                </div>

                <div className="flex items-center gap-6 bg-emerald-500/5 border border-emerald-500/10 p-4 px-8 rounded-md shadow-inner">
                    <div className="relative">
                        <Navigation className="text-emerald-400 w-8 h-8 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Current Status</p>
                        <p className="text-xl font-black text-white uppercase tracking-tighter italic">Live Tracking Active</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Vehicle & Route Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-luxury-rose/5 rounded-full blur-3xl group-hover:bg-luxury-rose/10 transition-all" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit flex items-center gap-2">
                            <Truck size={14} className="text-luxury-rose" /> Vehicle Node
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Registry Number</p>
                                <p className="text-2xl font-black text-white tracking-widest uppercase">{route.vehicleId?.registrationNumber || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Manifest</p>
                                    <p className="text-xs font-bold text-slate-300 uppercase">{route.vehicleId?.type || 'Bus'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Capacity</p>
                                    <p className="text-xs font-bold text-slate-300 uppercase">{route.vehicleId?.capacity || '50'} Units</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-800/60">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <User className="text-slate-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Pilot</p>
                                        <p className="text-sm font-black text-white uppercase">{route.vehicleId?.driverName || 'Verified Official'}</p>
                                        <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{route.vehicleId?.driverContact || '+91 999 888 777'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit flex items-center gap-2">
                            <Shield size={14} className="text-emerald-400" /> Operational Security
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-950/40 rounded border border-slate-900 flex items-center gap-4">
                                <AlertCircle size={18} className="text-amber-400" />
                                <div className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                                    Notify control center immediately in case of delay discrepancy.
                                </div>
                            </div>
                            <button className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2">
                                <Phone size={14} /> Emergency Uplink
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Route Visualization / Stops */}
                <div className="lg:col-span-2 bg-[#0a0a0c] border border-brand-border/40 rounded-md overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-8 border-b border-slate-800/60 flex items-center justify-between bg-black/40">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Grid Sequence</h4>
                            <p className="text-lg font-black uppercase tracking-tight italic">{route.name} Channel</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">
                               <Clock size={12} /> Sync: +0.0s
                           </span>
                        </div>
                    </div>

                    <div className="flex-1 p-10 relative">
                        {/* Timeline Connector */}
                        <div className="absolute left-[59px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-emerald-500 via-luxury-rose to-blue-500 opacity-20" />
                        
                        <div className="space-y-12 relative">
                            {route.stops?.map((stop, idx) => {
                                const isPickup = stop.name === assignment.pickupStop;
                                const isDropoff = stop.name === assignment.dropoffStop;
                                const isSpecial = isPickup || isDropoff;

                                return (
                                    <div key={idx} className={`flex items-start gap-8 group transition-all ${isSpecial ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all ${isSpecial ? 'bg-black border-luxury-rose shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-900 border-slate-800'}`}>
                                                <MapPin size={16} className={isSpecial ? 'text-luxury-rose' : 'text-slate-700'} />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-800 uppercase italic">STP-{idx + 1}</span>
                                        </div>
                                        
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className={`text-sm font-black uppercase tracking-widest italic transition-colors ${isSpecial ? 'text-white' : 'text-slate-500'}`}>
                                                    {stop.name}
                                                </h5>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">{stop.estimatedTime || '---'}</span>
                                            </div>
                                            
                                            {isPickup && (
                                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Designated Extraction Point</span>
                                                </div>
                                            )}

                                            {isDropoff && (
                                                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Target Ingress Point</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-800/60 bg-black/40 flex items-center gap-6">
                        <Info size={18} className="text-slate-600 shrink-0" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase border-l border-slate-800/60 pl-6 leading-relaxed">
                            Sequence reflects real-time operational flow. Timings are variable based on grid congestion levels.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChildTransport;
