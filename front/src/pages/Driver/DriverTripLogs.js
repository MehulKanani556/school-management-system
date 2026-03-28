import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverTripLogsSlice } from '../../redux/slice/transport.slice';
import { ClipboardList, Bus, User, Calendar, History, Clock, CheckCircle2, MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverTripLogs = () => {
    const dispatch = useDispatch();
    const { tripLogs, loading } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        dispatch(fetchDriverTripLogsSlice({ date: selectedDate }));
    }, [dispatch, selectedDate]);

    // Backend filters by driver userId now, so we just use tripLogs directly
    const myLogs = tripLogs;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500">Trip History</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Your old bus trips and records (पुराने सफर)</p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="text-[9px] font-black uppercase text-slate-500 italic">Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-neutral-900 border border-slate-800/60 rounded-md py-2 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all italic h-[40px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {myLogs.length > 0 ? myLogs.map((log) => (
                    <div key={log._id} className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden group hover:border-emerald-500/30 transition-all shadow-xl">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-950/40">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-md bg-neutral-900 border border-slate-800 flex items-center justify-center ${log.type === 'Pickup' ? 'text-emerald-500 border-emerald-500/20' : 'text-blue-500 border-blue-500/20'}`}>
                                    <Bus size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tighter leading-none">{log.routeId?.name || 'Bus Route'}</h3>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${log.type === 'Pickup' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-600/20'}`}>
                                            {log.type === 'Pickup' ? 'Morning' : 'Afternoon'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(log.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 font-bold text-emerald-500/80"><CheckCircle2 size={10} /> Status: {log.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 md:text-right">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase italic">Vehicle Used</p>
                                    <p className="text-sm font-black text-slate-300 uppercase italic tracking-tighter leading-none">{log.vehicleId?.registrationNumber || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 text-emerald-500">
                                    <p className="text-[9px] font-black text-slate-600 uppercase italic">Total Boarded</p>
                                    <p className="text-sm font-black uppercase italic tracking-tighter leading-none">{log.attendance?.filter(a => a.boarded).length} / {log.attendance?.length} Students</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center border border-slate-800 border-dashed rounded-md bg-neutral-900/10">
                        <History size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                        <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-60">No records found for this date. (इस दिन का कोई रिकॉर्ड नहीं है)</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DriverTripLogs;
