import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, updateVehicleLocationSlice } from '../../redux/slice/transport.slice';
import { 
    Navigation, Activity, Signal, Radio, 
    Bus, MapPin, Compass, Shield, 
    Zap, AlertCircle, Info, Target,
    Crosshair, MousePointer2, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tracking = () => {
    const dispatch = useDispatch();
    const { vehicles } = useSelector((state) => state.transport);
    const [selectedId, setSelectedId] = useState(null);
    const [radarActive, setRadarActive] = useState(true);
    const [scanPulse, setScanPulse] = useState(0);

    // Simulation of moving vehicles
    const [simulatedCoords, setSimulatedCoords] = useState({});

    useEffect(() => {
        dispatch(fetchVehicles());
        
        const interval = setInterval(() => {
            setScanPulse(prev => (prev + 1) % 4);
        }, 1500);

        const moveInterval = setInterval(() => {
            setSimulatedCoords(prev => {
                const next = { ...prev };
                vehicles.forEach(v => {
                    if (!next[v._id]) {
                        next[v._id] = {
                            lat: 23.0225 + (Math.random() - 0.5) * 0.01,
                            lng: 72.5714 + (Math.random() - 0.5) * 0.01,
                            heading: Math.random() * 360,
                            speed: 40 + Math.random() * 20
                        };
                    } else {
                        next[v._id] = {
                            lat: next[v._id].lat + (Math.random() - 0.5) * 0.0001,
                            lng: next[v._id].lng + (Math.random() - 0.5) * 0.0001,
                            heading: (next[v._id].heading + (Math.random() - 0.5) * 10) % 360,
                            speed: Math.max(0, next[v._id].speed + (Math.random() - 0.5) * 5)
                        };
                    }
                });
                return next;
            });
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(moveInterval);
        };
    }, [dispatch, vehicles]);

    const activeVehicle = vehicles.find(v => v._id === selectedId) || vehicles[0];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-6 font-outfit overflow-hidden">
            {/* Left Sidebar - Fleet Status */}
            <div className="w-full xl:w-96 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                <header className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-500 animate-pulse">
                            <Radio size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Fleet Radar</h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-70">Real-time terminal uplink</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Active Nodes</p>
                            <span className="text-2xl font-black italic text-orange-500 tracking-tighter">{vehicles.length}</span>
                        </div>
                        <div className="p-4 bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Signal Saturation</p>
                            <span className="text-2xl font-black italic text-emerald-500 tracking-tighter">98.4%</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none ml-1">Terminal Roster</p>
                    {vehicles.map(vehicle => (
                        <div 
                            key={vehicle._id}
                            onClick={() => setSelectedId(vehicle._id)}
                            className={`p-6 rounded-md border cursor-pointer transition-all group ${selectedId === vehicle._id ? 'bg-orange-600/10 border-orange-600/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-neutral-950/40 border-slate-800/60 hover:border-slate-700'}`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-md border ${selectedId === vehicle._id ? 'bg-orange-600 text-white border-orange-600' : 'bg-neutral-900 border-slate-800 group-hover:border-orange-600/40 text-slate-500 transition-all'}`}>
                                        <Bus size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-100 mb-1">{vehicle.registrationNumber}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase italic">Uplink Stable</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {simulatedCoords[vehicle._id] && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-black italic text-white leading-none mb-1">{simulatedCoords[vehicle._id].speed.toFixed(0)} <span className="text-slate-600">KM/H</span></p>
                                        <p className="text-[8px] font-black text-slate-600 uppercase italic tracking-widest">Sector V{vehicle._id.slice(-2)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Radar Map Implementation */}
            <div className="flex-1 bg-neutral-900 border border-slate-800/60 rounded-md relative overflow-hidden shadow-2xl">
                {/* Radar Grid Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border border-slate-700 rounded-full"></div>
                        <div className="w-[600px] h-[600px] border border-slate-800 rounded-full"></div>
                        <div className="w-[900px] h-[900px] border border-slate-800 rounded-full"></div>
                        <div className="absolute w-full h-px bg-slate-800"></div>
                        <div className="absolute h-full w-px bg-slate-800"></div>
                    </div>
                </div>

                {/* Radar Sweep Animation */}
                <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 z-10 pointer-events-none opacity-10"
                    style={{ background: 'conic-gradient(from 0deg, #f97316 10%, transparent 60%)' }}
                />

                {/* Simulated Vehicle Markers on Map */}
                <div className="absolute inset-0 z-20">
                    {vehicles.map(v => {
                        const coords = simulatedCoords[v._id];
                        if (!coords) return null;
                        
                        // Simple proportional mapping for visual representation (mocking a localized map area)
                        const centerX = 50; // percentage
                        const centerY = 50;
                        const x = centerX + (coords.lng - 72.5714) * 5000;
                        const y = centerY + (23.0225 - coords.lat) * 5000;

                        return (
                            <motion.div 
                                key={v._id}
                                style={{ left: `${x}%`, top: `${y}%` }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-[3000ms] ease-linear cursor-pointer group/marker`}
                                onClick={() => setSelectedId(v._id)}
                            >
                                <div className="relative">
                                    {/* Pulse Effect */}
                                    <div className={`absolute -inset-4 rounded-full ${selectedId === v._id ? 'bg-orange-500/20' : 'bg-slate-500/10'} animate-ping`}></div>
                                    
                                    {/* Marker Icon */}
                                    <div className={`w-10 h-10 rounded-md border flex items-center justify-center shadow-2xl backdrop-blur-md transition-all ${selectedId === v._id ? 'bg-orange-600 border-orange-400 text-white scale-125 z-40' : 'bg-neutral-900 border-slate-700 text-slate-500 grayscale opacity-60 z-30'}`}>
                                        <Bus size={18} style={{ transform: `rotate(${coords.heading}deg)` }} />
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-neutral-950 border border-white/10 p-3 rounded shadow-2xl opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        <p className="text-[11px] font-black italic text-orange-500 uppercase leading-none mb-1">{v.registrationNumber}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-black text-white italic">{coords.speed.toFixed(0)} KM/H</span>
                                            <span className="text-[8px] font-black text-slate-600 italic">|</span>
                                            <span className="text-[8px] font-black text-white italic">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Active Unit Stats Panel */}
                {activeVehicle && simulatedCoords[activeVehicle._id] && (
                    <motion.div 
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={activeVehicle._id}
                        className="absolute right-8 top-8 w-80 bg-neutral-950/80 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 hidden md:block"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="p-3 bg-orange-600 rounded text-white shadow-xl shadow-orange-600/20">
                                    <Target size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none mb-1">{activeVehicle.registrationNumber}</h3>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic opacity-80 leading-none">REAL-TIME TELEMETRY ACTIVE</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Velocity Vector</p>
                                    <p className="text-sm font-black text-white italic">{simulatedCoords[activeVehicle._id].speed.toFixed(1)} <span className="text-[10px] text-slate-500 tracking-normal">KM/H</span></p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Heading Alpha</p>
                                    <p className="text-sm font-black text-white italic">{simulatedCoords[activeVehicle._id].heading.toFixed(0)}° <span className="text-[10px] text-slate-500 tracking-normal">NNE</span></p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity size={12} className="text-orange-500" />
                                        <span className="text-[10px] font-black text-slate-400 italic">ENGINE STATUS</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 italic uppercase">OPTIMAL</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield size={12} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-400 italic">ENCRYPTION</span>
                                        </div>
                                    <span className="text-[10px] font-black text-slate-200 italic uppercase underline">AES-256V2</span>
                                </div>
                            </div>
                            
                            <button className="w-full py-4 bg-orange-600/10 border border-orange-600/30 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] italic rounded hover:bg-orange-600 hover:text-white transition-all">ESTABLISH COM-LINK</button>
                        </div>
                    </motion.div>
                )}

                {/* Map Control Cluster */}
                <div className="absolute bottom-8 left-8 flex items-center gap-3 z-40">
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Layers size={18} /></button>
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Crosshair size={18} /></button>
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Compass size={18} /></button>
                </div>

                {/* Live Feed Terminal */}
                <div className="absolute bottom-8 right-8 z-40 hidden xl:block">
                    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/5 p-6 rounded shadow-2xl w-96 space-y-4 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest italic">Terminal Logs</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <div className="space-y-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] UPLINK ESTABLISHED WITH SECTOR 4</p>
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] COORDINATE SYNC: 23.0225N, 72.5714E</p>
                            <p className="text-[9px] font-mono text-slate-300 leading-none font-bold">[{new Date().toLocaleTimeString()}] UNIT {activeVehicle?.registrationNumber} REPORTING STATUS 200</p>
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] BACKGROUND SCAN: NO ANOMALIES DETECTED</p>
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] ENCRYPTION KEY ROTATED: 0x82...FA</p>
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] BUFFER REPLENISHED (4/4)</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Tracking;
