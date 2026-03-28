import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTransport, applyStudentTransport } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Clock, User, Shield, Navigation, AlertCircle, Phone, Info, Wifi } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import LiveMap from '../../components/Transport/LiveMap';

const StudentTransport = () => {
    const dispatch = useDispatch();
    const { socket, isConnected } = useSocket();
    const { profile, transport, loading } = useSelector((state) => state.student);
    const [liveLocation, setLiveLocation] = useState(null);

    useEffect(() => {
        dispatch(fetchStudentTransport());
    }, [dispatch]);

    useEffect(() => {
        if (socket && transport?.route?.vehicleId?._id) {
            const vehicleId = transport.route.vehicleId._id;
            socket.emit('subscribe_to_vehicle', vehicleId);

            const handleLocationUpdate = (data) => {
                if (data.vehicleId === vehicleId) {
                    setLiveLocation(data);
                }
            };

            socket.on('vehicle_location_updated', handleLocationUpdate);

            // Initial location from vehicle model
            if (transport.route.vehicleId.currentLocation) {
                setLiveLocation({
                    ...transport.route.vehicleId.currentLocation,
                    vehicleId
                });
            }

            return () => {
                socket.off('vehicle_location_updated', handleLocationUpdate);
            };
        }
    }, [socket, transport?.route?.vehicleId?._id]);

    if (loading && !transport) {
        return (
            <div className="flex flex-col items-center justify-center h-full pt-40 opacity-50 space-y-4 font-outfit">
                <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Uplinking to Fleet Management...</span>
            </div>
        );
    }

    if (!transport) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 p-10 bg-brand-surface/20 rounded-xl border border-brand-border/20 backdrop-blur-sm font-outfit">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-800/40 flex items-center justify-center animate-spin-slow">
                         <div className="w-24 h-24 rounded-full border-4 border-slate-800/20" />
                    </div>
                    <Truck size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" />
                </div>
                
                <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none font-outfit">Logistical Connectivity Required</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                        {profile?.transportStatus === 'Applied' 
                            ? "Institutional inquiry successful. Awaiting route vector allocation from administration."
                            : "Your profile is not currently indexed in the transport grid. Initiate enrollment protocol below."}
                    </p>
                    
                    {profile?.transportStatus === 'Applied' ? (
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse shadow-lg shadow-amber-500/5">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Application Pending Approval</span>
                        </div>
                    ) : (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dispatch(applyStudentTransport())}
                            disabled={loading}
                            className="px-10 py-5 bg-brand-primary text-black text-[11px] font-black uppercase tracking-[.3em] italic rounded-md shadow-2xl shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all flex items-center gap-3 mx-auto leading-none disabled:opacity-50"
                        >
                            {loading ? "Synthesizing Request..." : "Apply for Transportation"}
                        </motion.button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4 border-t border-slate-800/40">
                    <div className="text-left">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[.2em] mb-1">Status</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase italic">{profile?.transportStatus || 'INACTIVE'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[.2em] mb-1">Protocol</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase italic">V5.0 Transport</p>
                    </div>
                </div>
            </div>
        );
    }

    const { route, assignment } = transport;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12 font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-brand-surface/40 p-10 rounded-md border border-brand-border/40 shadow-2xl backdrop-blur-xl group">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-[2px] bg-brand-primary rounded-md"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Fleet Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none font-outfit italic">Transport Logistics</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide italic leading-none">Real-time route synchronization for your daily transit.</p>
                </div>

                <div className={`flex items-center gap-6 ${isConnected ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'} border p-4 px-8 rounded-md shadow-inner transition-colors`}>
                    <div className="relative">
                        <Navigation className={`${isConnected ? 'text-emerald-400' : 'text-red-400'} w-8 h-8 animate-pulse`} />
                        {isConnected && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />}
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Uplink Status</p>
                        <p className={`text-xl font-black ${isConnected ? 'text-white' : 'text-red-500'} uppercase tracking-tighter italic`}>
                            {isConnected ? 'Live Matrix Active' : 'Uplink Offline'}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Vehicle & Route Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit flex items-center gap-2 italic">
                            <Truck size={14} className="text-brand-primary" /> Vehicle Node
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
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Pilot (ड्राइवर)</p>
                                        <p className="text-sm font-black text-white uppercase">{route.vehicleId?.driverName || 'Verified Official'}</p>
                                        <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{route.vehicleId?.driverContact || '+91 999 888 777'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 italic">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 font-outfit flex items-center gap-2">
                            <Shield size={14} className="text-emerald-400" /> Operational Security
                        </h3>
                        <div className="space-y-4 font-outfit">
                            <div className="p-4 bg-slate-950/40 rounded border border-slate-900 flex items-center gap-4">
                                <AlertCircle size={18} className="text-amber-400" />
                                <div className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                                    Notify school control center immediately in case of delay discrepancy.
                                </div>
                            </div>
                            <button className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2">
                                <Phone size={14} /> Emergency Contact
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Map & Progress */}
                <div className="lg:col-span-2 space-y-8 font-outfit">
                    {/* Live Map implementation */}
                    <div className="bg-[#0a0a0c] border border-brand-border/40 rounded-md aspect-video overflow-hidden relative shadow-2xl group italic uppercase">
                        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-[1000] flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-md bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary animate-pulse">
                                    <Wifi size={20} />
                                </div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] shadow-brand-primary">Satellite Telemetry Uplink active</h4>
                            </div>
                        </div>
                        <LiveMap 
                            vehicleLocation={liveLocation} 
                            stops={route.stops?.map(s => ({
                                ...s,
                                isTarget: s.name === assignment?.pickupStop || s.name === assignment?.dropoffStop
                            }))} 
                        />
                    </div>

                    <div className="bg-[#0a0a0c] border border-brand-border/40 rounded-md overflow-hidden flex flex-col shadow-2xl font-outfit italic uppercase">
                        <div className="p-8 border-b border-slate-800/60 flex items-center justify-between bg-black/40">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Grid Sequence</h4>
                                <p className="text-lg font-black uppercase tracking-tight italic">{route.name} Channel</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className={`flex items-center gap-2 text-[9px] font-black ${liveLocation ? 'text-emerald-400' : 'text-slate-600'} uppercase tracking-widest italic`}>
                                   <Clock size={12} /> Sync: {liveLocation ? '+0.0s' : 'Searching...'}
                               </span>
                            </div>
                        </div>

                        <div className="flex-1 p-10 relative">
                            {/* Timeline Connector */}
                            <div className="absolute left-[59px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-emerald-500 via-brand-primary to-blue-500 opacity-20" />
                            
                            <div className="space-y-12 relative">
                                {route.stops?.map((stop, idx) => {
                                    const isPickup = stop.name === assignment?.pickupStop;
                                    const isDropoff = stop.name === assignment?.dropoffStop;
                                    const isSpecial = isPickup || isDropoff;
                                    
                                    // Real-time status calculation
                                    let status = 'pending'; // pending, reached, current
                                    if (liveLocation && stop.lat && stop.lng) {
                                        const dist = Math.sqrt(
                                            Math.pow(liveLocation.lat - stop.lat, 2) + 
                                            Math.pow(liveLocation.lng - stop.lng, 2)
                                        );
                                        // Simple distance check (approx degrees to meters: 0.001 is ~111m)
                                        if (dist < 0.0005) {
                                            status = 'reached';
                                        }
                                    }

                                    return (
                                        <div key={idx} className={`flex items-start gap-8 group transition-all ${isSpecial ? 'scale-105' : 'opacity-80 hover:opacity-100'} ${status === 'reached' ? 'opacity-50' : ''}`}>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all ${status === 'reached' ? 'bg-emerald-600/20 border-emerald-500' : isSpecial ? 'bg-black border-brand-primary shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-900 border-slate-800'}`}>
                                                    {status === 'reached' ? (
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                    ) : (
                                                        <MapPin size={16} className={isSpecial ? 'text-brand-primary' : 'text-slate-700'} />
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-800 uppercase italic">STP-{idx + 1}</span>
                                            </div>
                                            
                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className={`text-sm font-black uppercase tracking-widest italic transition-colors ${status === 'reached' ? 'text-emerald-500' : isSpecial ? 'text-white' : 'text-slate-500'}`}>
                                                        {stop.name}
                                                    </h5>
                                                    <div className="flex items-center gap-3">
                                                         {status === 'reached' && <span className="text-[8px] font-black text-emerald-500 uppercase italic tracking-widest">Crossed</span>}
                                                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">{stop.estimatedTime || '---'}</span>
                                                    </div>
                                                </div>
                                                
                                                {isPickup && (
                                                    <div className={`inline-flex items-center gap-3 px-4 py-1.5 ${status === 'reached' ? 'bg-emerald-500/5' : 'bg-brand-primary/10'} border border-brand-primary/20 rounded-full transition-all leading-none`}>
                                                        <div className={`w-1.5 h-1.5 bg-brand-primary rounded-full ${status === 'reached' ? '' : 'animate-ping'}`} />
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'reached' ? 'text-brand-primary/60' : 'text-brand-primary'}`}>My Official Pickup Point</span>
                                                    </div>
                                                )}

                                                {isDropoff && (
                                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full ml-2 leading-none">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">My Target Drop Point</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-800/60 bg-black/40 flex items-center gap-6 font-outfit">
                            <Info size={18} className="text-slate-600 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-600 uppercase border-l border-slate-800/60 pl-6 leading-relaxed italic">
                                Sequence reflects real-time operational flow. Timings are variable based on grid congestion levels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentTransport;
