import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, updateVehicleLocationSlice } from '../../redux/slice/transport.slice';
import {
    Navigation, Activity, Signal, Radio,
    Bus, MapPin, Compass, Shield,
    Zap, AlertCircle, Info, Target,
    Crosshair, MousePointer2, Layers, Wifi, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import LiveMap from '../../components/Transport/LiveMap';
import toast from 'react-hot-toast';

const Tracking = () => {
    const dispatch = useDispatch();
    const { socket, isConnected } = useSocket();
    const { vehicles } = useSelector((state) => state.transport);
    const [selectedId, setSelectedId] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [fleetLocations, setFleetLocations] = useState({});

    useEffect(() => {
        dispatch(fetchVehicles());

        if (socket) {
            socket.emit('subscribe_to_fleet');

            socket.on('fleet_init', (locations) => {
                const locMap = {};
                locations.forEach(loc => {
                    locMap[loc.vehicleId] = loc;
                });
                setFleetLocations(locMap);
            });

            socket.on('fleet_location_updated', (data) => {
                setFleetLocations(prev => ({
                    ...prev,
                    [data.vehicleId]: data
                }));
            });

            return () => {
                socket.off('fleet_init');
                socket.off('fleet_location_updated');
            };
        }
    }, [dispatch, socket]);

    const activeVehicle = vehicles.find(v => v._id === (selectedId || vehicles[0]?._id));

    const startTracking = () => {
        if (!selectedId) {
            toast.error("Please select a vehicle first");
            return;
        }

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, heading, speed } = position.coords;
                const update = {
                    vehicleId: selectedId,
                    lat: latitude,
                    lng: longitude,
                    heading: heading || 0,
                    speed: (speed || 0) * 3.6 // Convert m/s to km/h
                };

                if (socket) {
                    socket.emit('update_vehicle_location', update);
                }

                setFleetLocations(prev => ({
                    ...prev,
                    [selectedId]: { ...update, updatedAt: new Date() }
                }));
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Failed to get location. Please ensure GPS is enabled.");
                stopTracking();
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );

        setWatchId(id);
        setIsTracking(true);
        toast.success("Uplink sequence started. Transmitting coordinates.");
    };

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
        toast.error("Uplink terminated. Transmission suspended.");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-6 font-outfit overflow-hidden">
            {/* Left Sidebar - Fleet Status */}
            <div className="w-full xl:w-96 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                <header className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-transporter-primary/10 border border-transporter-primary/30 flex items-center justify-center text-transporter-primary animate-pulse">
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
                            <span className="text-2xl font-black italic text-transporter-primary tracking-tighter">{vehicles.length}</span>
                        </div>
                        <div className="p-4 bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Signal Status</p>
                            <span className={`text-2xl font-black italic ${isConnected ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                {isConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none ml-1">Terminal Roster</p>
                    {vehicles.map(vehicle => (
                        <div
                            key={vehicle._id}
                            onClick={() => setSelectedId(vehicle._id)}
                            className={`p-6 rounded-md border cursor-pointer transition-all group ${selectedId === vehicle._id ? 'bg-transporter-primary/10 border-transporter-primary/50 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'bg-neutral-950/40 border-slate-800/60 hover:border-slate-700'}`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-md border ${selectedId === vehicle._id ? 'bg-transporter-primary text-white border-transporter-primary' : 'bg-neutral-900 border-slate-800 group-hover:border-transporter-primary/40 text-slate-500 transition-all'}`}>
                                        <Bus size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter text-slate-100 mb-1">{vehicle.registrationNumber}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${fleetLocations[vehicle._id] ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase italic">
                                                {fleetLocations[vehicle._id] ? 'Uplink Active' : 'No Signal'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {fleetLocations[vehicle._id] && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-black italic text-white leading-none mb-1">{fleetLocations[vehicle._id].speed?.toFixed(0) || 0} <span className="text-slate-600">KM/H</span></p>
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
                <LiveMap
                    vehicleLocation={selectedId ? fleetLocations[selectedId] : null}
                    stops={[]} // Add stops if needed for the driver
                    autoCenter={true}
                />

                {/* Active Unit Stats Panel */}
                {activeVehicle && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={activeVehicle._id}
                        className="absolute right-8 top-8 w-80 bg-neutral-950/80 backdrop-blur-2xl border border-white/5 rounded-md p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[1001] hidden md:block"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="p-3 bg-transporter-primary rounded text-white shadow-xl shadow-transporter-primary/20">
                                    <Target size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none mb-1">{activeVehicle.registrationNumber}</h3>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic opacity-80 leading-none">
                                        {isTracking ? 'COORDINATE TRANSMISSION ACTIVE' : 'SYSTEM STANDBY'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Velocity Vector</p>
                                    <p className="text-sm font-black text-white italic">{fleetLocations[activeVehicle._id]?.speed?.toFixed(1) || '0.0'} <span className="text-[10px] text-slate-500 tracking-normal">KM/H</span></p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Heading Alpha</p>
                                    <p className="text-sm font-black text-white italic">{fleetLocations[activeVehicle._id]?.heading?.toFixed(0) || '0'}° <span className="text-[10px] text-slate-500 tracking-normal">DEG</span></p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity size={12} className="text-transporter-primary" />
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

                            <button className="w-full py-4 bg-transporter-primary/10 border border-transporter-primary/30 text-transporter-primary text-[10px] font-black uppercase tracking-[0.2em] italic rounded hover:bg-transporter-primary hover:text-white transition-all">ESTABLISH COM-LINK</button>
                        </div>
                    </motion.div>
                )}

                {/* Map Control Cluster */}
                <div className="absolute bottom-8 left-8 flex items-center gap-3 z-[1001]">
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Layers size={18} /></button>
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Crosshair size={18} /></button>
                    <button className="w-12 h-12 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-2xl backdrop-blur-md"><Compass size={18} /></button>
                </div>

                {/* Live Feed Terminal */}
                <div className="absolute bottom-8 right-8 z-[1001] hidden xl:block">
                    <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/5 p-6 rounded shadow-2xl w-96 space-y-4 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-[9px] font-black text-transporter-primary uppercase tracking-widest italic">Terminal Logs</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <div className="space-y-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] {isConnected ? 'UPLINK ESTABLISHED' : 'COMMAND LINK OFFLINE'}</p>
                            {isTracking && fleetLocations[selectedId] && (
                                <>
                                    <p className="text-[9px] font-mono text-slate-300 leading-none">[{new Date().toLocaleTimeString()}] COORDS: {fleetLocations[selectedId].lat.toFixed(4)}N, {fleetLocations[selectedId].lng.toFixed(4)}E</p>
                                    <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] BUFFER REPLENISHED (Active)</p>
                                </>
                            )}
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] BACKGROUND SCAN: NO ANOMALIES</p>
                            <p className="text-[9px] font-mono text-slate-500 leading-none">[{new Date().toLocaleTimeString()}] ENCRYPTION KEY ROTATED</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Tracking;
