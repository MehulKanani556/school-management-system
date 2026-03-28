import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchDriverTripLogsSlice, startDriverTripSlice, updateTripStatusSlice, 
    toggleBoardingSlice, fetchDriverRoutesSlice, fetchDriverProfileSlice
} from '../../redux/slice/transport.slice';
import { Play, Square, CheckCircle2, Clock, MapPin, Bus, User, Timer, AlertTriangle, PlayCircle, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DriverActiveTrip = () => {
    const dispatch = useDispatch();
    const { tripLogs, routes, driverProfile, loading } = useSelector((state) => state.transport);
    const { user } = useSelector((state) => state.auth);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [tripType, setTripType] = useState('Pickup');

    useEffect(() => {
        dispatch(fetchDriverProfileSlice());
        dispatch(fetchDriverTripLogsSlice({ date: new Date().toISOString().split('T')[0] }));
        dispatch(fetchDriverRoutesSlice());
    }, [dispatch]);

    // Check if there is already an active trip for this driver
    const activeTrip = tripLogs.find(log => 
        (log.status === 'In-Progress' || log.status === 'Scheduled')
    );

    const requestLocationPermission = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser (लोकेशन सपोर्ट नहीं करता)");
                reject("Not supported");
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve(position),
                    (error) => {
                        toast.error("Please allow location access to start the trip (सफर शुरू करने के लिए लोकेशन परमिशन दें)");
                        reject(error);
                    }
                );
            }
        });
    };

    const handleStartTrip = async (id) => {
        try {
            await requestLocationPermission();
            dispatch(updateTripStatusSlice({ id, status: 'In-Progress' }))
                .then(() => toast.success('Trip Started! (सफर चालू हुआ)'));
        } catch (error) {
            console.error("Location permission failed:", error);
        }
    }

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        const route = routes.find(r => r._id === selectedRouteId);
        if (!route) return;

        try {
            await requestLocationPermission();
            const formData = {
                routeId: selectedRouteId,
                vehicleId: route.vehicleId?._id || '',
                type: tripType,
                attendance: route.assignedStudents.map(as => ({
                    studentId: as.studentId._id,
                    boarded: false
                })),
                date: new Date().toISOString().split('T')[0]
            };

            dispatch(startDriverTripSlice(formData))
                .then(() => {
                    toast.success('Duty Shift Commenced! (ड्यूटी शुरू हुई)');
                    dispatch(fetchDriverTripLogsSlice({ date: new Date().toISOString().split('T')[0] }));
                });
        } catch (error) {
            console.error("Location permission failed:", error);
        }
    }

    const handleFinishTrip = (e) => {
        e.preventDefault();
        dispatch(updateTripStatusSlice({ id: activeTrip._id, status: 'Completed', delayReason }))
            .then(() => {
                toast.success('Trip Completed! (सफर पूरा हुआ)');
                setIsCompleteOpen(false);
                setDelayReason('');
            });
    }

    const handleBoarding = (studentId, wasBoarded) => {
        dispatch(toggleBoardingSlice({ id: activeTrip._id, studentId, boarded: !wasBoarded }));
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2 italic">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500 font-outfit">Start Duty / Trip</h2>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Manage your live bus trip and students. (आज का सफर)</p>
                </div>
            </div>

            {activeTrip ? (
                <div className="space-y-6">
                    {/* Active Trip Head Card */}
                    <div className="bg-neutral-900 border border-emerald-500/30 rounded-md overflow-hidden shadow-3xl group transition-all font-outfit">
                        <div className="p-10 border-b border-slate-800/60 flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-neutral-950/40 relative">
                            {activeTrip.status === 'In-Progress' && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                                </div>
                            )}
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-md bg-neutral-900 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10`}>
                                    <Bus size={32} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{activeTrip.routeId?.name}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${activeTrip.type === 'Pickup' ? 'bg-emerald-500 text-black' : 'bg-blue-600 text-white'} italic`}>
                                            {activeTrip.type === 'Pickup' ? 'Morning Trip' : 'Afternoon Trip'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-black tracking-widest text-slate-500 uppercase italic opacity-70">{activeTrip.vehicleId?.registrationNumber} • {new Date(activeTrip.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 xl:gap-12">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">Boarded Today</p>
                                    <p className="text-xl font-black text-emerald-500 italic tracking-tighter leading-none">{activeTrip.attendance?.filter(a => a.boarded).length} / {activeTrip.attendance?.length}</p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {activeTrip.status === 'Scheduled' ? (
                                        <button 
                                            onClick={() => handleStartTrip(activeTrip._id)}
                                            className="px-10 py-4 bg-emerald-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center gap-3 animate-bounce"
                                        >
                                            <Play size={14} fill="currentColor" /> Start Trip (सफर शुरू करें)
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setIsCompleteOpen(true)}
                                            className="px-10 py-4 bg-rose-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded shadow-xl shadow-rose-600/20 hover:bg-rose-500 transition-all flex items-center gap-3"
                                        >
                                            <Square size={14} fill="currentColor" /> Finish Trip (सफर पूरा करें)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-brand-background/20">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-slate-800/60 pb-4 italic">Student Attendance (उपस्थिति दर्ज करें)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {activeTrip.attendance?.map((as, idx) => {
                                    // Find student stop from route details
                                    const studentRouteInfo = activeTrip.routeId?.assignedStudents?.find(
                                        s => (s.studentId?._id || s.studentId) === (as.studentId?._id || as.studentId)
                                    );
                                    const assignedStop = activeTrip.type === 'Pickup' ? studentRouteInfo?.pickupStop : studentRouteInfo?.dropoffStop;

                                    return (
                                        <button
                                            key={idx}
                                            disabled={activeTrip.status !== 'In-Progress'}
                                            onClick={() => handleBoarding(as.studentId?._id, as.boarded)}
                                            className={`p-5 rounded border transition-all flex items-center justify-between gap-4 text-left italic group ${as.boarded ? 'bg-emerald-600/5 border-emerald-500/30' : 'bg-neutral-950 border-slate-800/60 opacity-60'} ${activeTrip.status === 'In-Progress' ? 'hover:scale-[1.03] active:scale-95 cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div className="overflow-hidden flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-xs font-black uppercase tracking-tighter truncate ${as.boarded ? 'text-emerald-400' : 'text-slate-500'}`}>{as.studentId?.firstName} {as.studentId?.lastName}</p>
                                                    {studentRouteInfo?.seatNumber && <span className="text-[8px] font-black bg-neutral-950 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-500 shrink-0">#{studentRouteInfo.seatNumber}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 opacity-80">
                                                    <MapPin size={10} className="text-emerald-500" />
                                                    <p className="text-[9px] font-bold uppercase tracking-widest truncate text-slate-400">
                                                        {assignedStop || 'Point Not Set'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 opacity-50">
                                                    <Clock size={10} className="text-slate-600" />
                                                    <p className="text-[8px] font-bold uppercase tracking-widest truncate text-slate-600">
                                                        {as.boardingTime ? new Date(as.boardingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
                                                    </p>
                                                </div>
                                            </div>
                                            {as.boarded ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center transition-all group-hover:border-emerald-500/40" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-3xl text-center max-w-2xl mx-auto font-outfit italic">
                    <PlayCircle size={64} className="mx-auto text-emerald-500/20 mb-8" />
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">No Active Trip Found</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic mb-10 leading-loose">You haven't started any trip for today yet. Choose a route below to begin your duty. (आज का नया सफर शुरू करें)</p>
                    
                    <form onSubmit={handleCreateTrip} className="space-y-6 text-left border-t border-slate-800/60 pt-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Select Your Route (अपना रास्ता चुनें)</label>
                            <select 
                                required
                                value={selectedRouteId}
                                onChange={(e) => setSelectedRouteId(e.target.value)}
                                className="w-full bg-neutral-950 border border-slate-800 text-slate-300 rounded-md py-4 px-6 text-xs font-bold uppercase tracking-widest italic focus:border-emerald-500/50 appearance-none"
                            >
                                <option value="">CHOOSE ROUTE...</option>
                                {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Trip Type (बस का समय)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => setTripType('Pickup')}
                                    className={`py-4 rounded-md border text-[11px] font-black uppercase tracking-widest italic transition-all ${tripType === 'Pickup' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-neutral-950 border-slate-800 text-slate-600'}`}
                                >
                                    Morning (सुबह)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setTripType('Dropoff')}
                                    className={`py-4 rounded-md border text-[11px] font-black uppercase tracking-widest italic transition-all ${tripType === 'Dropoff' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-neutral-950 border-slate-800 text-slate-600'}`}
                                >
                                    Afternoon (दोपहर)
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={!selectedRouteId}
                            className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs italic rounded-md shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all disabled:opacity-50 mt-10"
                        >
                            Confirm & Begin Duty (ड्यूटी शुरू करें)
                        </button>
                    </form>
                </div>
            )}

            <AnimatePresence>
                {isCompleteOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCompleteOpen(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-md rounded-md border border-slate-800 shadow-3xl relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={handleFinishTrip} className="p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-8 pb-4 border-b border-slate-800/60 flex items-center gap-3">
                                    <StopCircle className="text-rose-500" /> Finish Duty (सफर खत्म करें)
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Delay Reason (वजह अगर देर हुई हो)</label>
                                        <textarea
                                            value={delayReason}
                                            onChange={(e) => setDelayReason(e.target.value)}
                                            placeholder="Example: Traffic Jam, Flat Tire..."
                                            className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic tracking-widest text-slate-100 italic focus:border-rose-500/50 min-h-[120px]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button type="button" onClick={() => setIsCompleteOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/20 transition-all rounded-md">Cancel</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-emerald-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">End Trip</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DriverActiveTrip;
