import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverRoutesSlice } from '../../redux/slice/transport.slice';
import { Navigation, List, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveMap from '../../components/Transport/LiveMap.jsx';

const DriverRouteMap = () => {
    const dispatch = useDispatch();
    const { routes, loading } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchDriverRoutesSlice());
    }, [dispatch]);

    // My Assigned Routes (already filtered by backend for the current driver)
    const myRoutes = routes;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2 italic">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500 font-outfit">My Bus Route Map</h2>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Check your stops, students, and roads. (मेरा बस रास्ता और स्टॉप)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {myRoutes.length > 0 ? myRoutes.map((route) => (
                    <div key={route._id} className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden relative group hover:border-emerald-600/30 transition-all shadow-2xl font-outfit">
                        <div className="p-10 flex flex-col xl:flex-row gap-12">
                            <div className="xl:w-80 shrink-0">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-md bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 font-black text-xl italic uppercase">
                                        <MapIcon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">{route.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">On Schedule (समय पर है)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10 border-t border-slate-800/60 font-outfit">
                                    <div className="flex items-center justify-between text-[11px] italic font-black text-slate-400 uppercase tracking-widest leading-none">
                                        <span>Bus Number</span>
                                        <span className="text-white">{route.vehicleId?.registrationNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] italic font-black text-slate-400 uppercase tracking-widest leading-none">
                                        <span>Total Stops</span>
                                        <span className="text-white">{route.stops?.length || 0} Points</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] italic font-black text-slate-400 uppercase tracking-widest leading-none">
                                        <span>Total Students</span>
                                        <span className="text-emerald-500">{route.assignedStudents?.length || 0} Joined</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="aspect-video rounded-md overflow-hidden border border-slate-800/60 mb-6">
                                    <LiveMap
                                        vehicleLocation={route.vehicleId?.currentLocation}
                                        stops={route.stops || []}
                                    />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-6 flex items-center gap-3 italic">
                                    <List size={14} /> My Road Points & Stops (रास्ता और स्टॉप)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {route.stops?.map((stop, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-neutral-950 border border-slate-800/60 rounded italic group hover:border-emerald-500/20 hover:bg-neutral-900 transition-all font-outfit">
                                            <div className="w-8 h-8 rounded-full bg-brand-background border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all">
                                                {i + 1}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[11px] font-black text-slate-200 uppercase tracking-tighter truncate leading-none mb-1">{stop.stopName}</p>
                                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate">{stop.arrivalTime || 'TBA'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center border-2 border-slate-800 border-dashed rounded-md bg-neutral-900/10 italic">
                        <Navigation size={40} className="mx-auto text-slate-700 mb-6 opacity-30" />
                        <p className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] opacity-40">No routes assigned to you yet. (आपको अभी तक कोई रास्ता नहीं मिला है।)</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DriverRouteMap;
