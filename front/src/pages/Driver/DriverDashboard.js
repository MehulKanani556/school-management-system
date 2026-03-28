import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Bus, Navigation, Users, MapPin, Loader2, Activity, Wrench, Wallet, Star, Fuel, Megaphone, Play, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { fetchDriverProfileSlice, fetchDriverTripLogsSlice } from '../../redux/slice/transport.slice';

const DriverDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { driverProfile, driverVehicle, tripLogs, loading } = useSelector((state) => state.transport);

    useEffect(() => {
        dispatch(fetchDriverProfileSlice());
        dispatch(fetchDriverTripLogsSlice({ date: new Date().toISOString().split('T')[0] }));
    }, [dispatch]);

    // Derived stats
    const todayTrips = tripLogs.filter(log => log.status === 'Completed').length;
    const activeTrip = tripLogs.find(log => log.status === 'In-Progress');
    const nextTrip = tripLogs.find(log => log.status === 'Scheduled');
    
    const stats = [
        { label: 'Bus Trips Today', value: todayTrips.toString().padStart(2, '0'), icon: Navigation, color: 'text-emerald-400', sub: `Last: ${todayTrips > 0 ? 'Done' : 'None'}` },
        { label: 'My Bus', value: driverVehicle?.registrationNumber || 'N/A', icon: Bus, color: 'text-blue-400', sub: driverVehicle?.model || 'Vehicle Assigned' },
        { label: 'My Rating', value: driverProfile?.performanceRating || '5.0', icon: Star, color: 'text-orange-400', sub: 'Top Driver' },
        { label: 'Next Trip', value: nextTrip ? new Date(nextTrip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--', icon: Clock, color: 'text-violet-400', sub: nextTrip?.routeId?.name || 'No more trips today' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none">Driver <span className="text-emerald-500">Center</span> (ड्राइवर पैनल)</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Namaste, {user?.firstName}! Here is your work schedule for today.</p>
                </div>
                {loading && <Loader2 size={16} className="text-emerald-500 animate-spin mb-2" />}
            </div>

            {/* Main Action Card */}
            <div className="bg-emerald-600/10 border border-emerald-500/20 p-10 rounded-md relative group overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-10">
                    <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                        <Navigation size={64} className="text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 border-2 border-emerald-500/40 border-dashed rounded-full animate-[spin_20s_linear_infinite]"></div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <span className={`px-3 py-1 ${activeTrip ? 'bg-orange-500' : 'bg-emerald-500'} text-black text-[9px] font-black uppercase tracking-widest rounded italic`}>
                                {activeTrip ? 'Current Session Live' : 'Duty Ready'}
                            </span>
                            <span className={`${activeTrip ? 'text-orange-500' : 'text-emerald-500'} font-black text-xs uppercase tracking-widest animate-pulse italic`}>
                                {activeTrip ? 'GPS Active' : 'Bus Ready'}
                            </span>
                        </div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-100 mb-2">
                            {activeTrip ? activeTrip.routeId?.name : (nextTrip ? nextTrip.routeId?.name : 'No Scheduled Routes')}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase italic leading-loose max-w-lg mb-8">
                            Your trip has 12 stops. Starting from School Main Gate to Green Valley Colony. Total 24 students will be picked up.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <NavLink 
                                to="/driver/active-trip" 
                                className={`px-8 py-3 ${activeTrip ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'} text-black font-black uppercase tracking-widest text-[11px] italic rounded transition-all flex items-center gap-3 shadow-lg`}
                            >
                                {activeTrip ? (
                                    <>
                                        <Activity size={14} className="animate-pulse" />
                                        Manage Active Trip (सफर जारी रखें)
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} className="fill-current" />
                                        Start Duty Now (ड्यूटी शुरू करें)
                                    </>
                                )}
                            </NavLink>
                            <NavLink to="/driver/route-map" className="px-8 py-3 bg-neutral-900 border border-emerald-500/30 text-emerald-500 font-black uppercase tracking-widest text-[11px] italic rounded hover:bg-emerald-500/10 transition-all flex items-center gap-3">
                                <MapPin size={14} />
                                View Map (रास्ता देखें)
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-slate-800/60 p-8 rounded-md relative overflow-hidden group hover:border-emerald-600/30 transition-all duration-300 shadow-2xl">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-md bg-neutral-950/60 border border-slate-800/60 ${stat.color} group-hover:border-emerald-600/40 transition-all`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 italic uppercase mb-2 tracking-tighter leading-none">{stat.value}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none opacity-60 mb-2">{stat.label}</p>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] italic leading-none">{stat.sub}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-[0.2em] mb-8 flex items-center gap-3">
                        <Clock size={16} className="text-emerald-500" /> My Past Trips (पुराने सफर)
                    </h3>
                    <div className="space-y-4">
                        {tripLogs.filter(t => t.status === 'Completed').slice(0, 3).map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-neutral-950 border border-slate-800/40 rounded italic group hover:border-emerald-500/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle size={14} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-200 uppercase tracking-tighter">{log.routeId?.name} ({log.type})</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-200 uppercase tracking-tighter">{log.attendance?.filter(a => a.boarded).length} Seats</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Done</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-[0.2em] mb-8 flex items-center gap-3">
                        <Megaphone size={16} className="text-orange-500" /> School Notices (सूचनायें)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: 'New route plan for next week', date: '1 hour ago', type: 'Urgent' },
                            { title: 'Monthly bus service date', date: 'Yesterday', type: 'Update' },
                        ].map((notice, i) => (
                            <div key={i} className="p-4 bg-neutral-950 border border-slate-800/40 rounded italic hover:bg-neutral-900/40 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${notice.type === 'Urgent' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>{notice.type}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase">{notice.date}</span>
                                </div>
                                <p className="text-xs font-black text-slate-200 uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{notice.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DriverDashboard;
