import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchTripLogsSlice, recordTripSlice, updateTripStatusSlice, 
    toggleBoardingSlice, fetchRoutesSlice, fetchDriversSlice, 
    fetchVehicles, clearTransportMessage 
} from '../../redux/slice/transport.slice';
import { ClipboardList, Bus, User, Calendar, Plus, Edit3, Check, X, Search, Navigation, Filter, MapPin, Clock, Play, CheckCircle2, AlertTriangle, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TripLogs = () => {
    const dispatch = useDispatch();
    const { tripLogs, routes, drivers, vehicles, loading, message, error } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isDelayOpen, setIsDelayOpen] = React.useState(false);
    const [selectedTrip, setSelectedTrip] = React.useState(null);
    const [delayReason, setDelayReason] = React.useState('');
    
    // Filtering states
    const [filterType, setFilterType] = React.useState('single'); // 'single' or 'range'
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);

    const [formData, setFormData] = React.useState({
        routeId: '',
        vehicleId: '',
        driverId: '',
        type: 'Pickup',
        attendance: []
    });

    useEffect(() => {
        const params = filterType === 'single' ? { date: selectedDate } : { startDate, endDate };
        dispatch(fetchTripLogsSlice(params));
        dispatch(fetchRoutesSlice());
        dispatch(fetchDriversSlice());
        dispatch(fetchVehicles());
    }, [dispatch, selectedDate, startDate, endDate, filterType]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            setIsAddOpen(false);
            setIsDelayOpen(false);
            setSelectedTrip(null);
            setDelayReason('');
            resetForm();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetForm = () => {
        setFormData({
            routeId: '',
            vehicleId: '',
            driverId: '',
            type: 'Pickup',
            attendance: []
        });
    }

    const handleRouteChange = (routeId) => {
        const route = routes.find(r => r._id === routeId);
        if (route) {
            setFormData({
                ...formData,
                routeId,
                vehicleId: route.vehicleId?._id || '',
                driverId: route.vehicleId?.driverId?._id || '',
                attendance: route.assignedStudents.map(as => ({
                    studentId: as.studentId._id,
                    boarded: false
                }))
            });
        }
    }

    const toggleNewLogAttendance = (studentId) => {
        setFormData({
            ...formData,
            attendance: formData.attendance.map(a => 
                a.studentId === studentId 
                ? { ...a, boarded: !a.boarded }
                : a
            )
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(recordTripSlice({ ...formData, date: selectedDate }));
    }

    const handleStatusTransition = (id, currentStatus) => {
        if (currentStatus === 'Scheduled') {
            dispatch(updateTripStatusSlice({ id, status: 'In-Progress' }));
        } else if (currentStatus === 'In-Progress') {
            setSelectedTrip({ _id: id });
            setIsDelayOpen(true);
        }
    }

    const handleCancelTrip = (id) => {
        if (window.confirm('Nullify this transit sequence?')) {
            dispatch(updateTripStatusSlice({ id, status: 'Cancelled' }));
        }
    }

    const commitCompletion = (e) => {
        e.preventDefault();
        dispatch(updateTripStatusSlice({ id: selectedTrip._id, status: 'Completed', delayReason }));
    }

    const handleLiveBoarding = (tripId, studentId, wasBoarded) => {
        dispatch(toggleBoardingSlice({ id: tripId, studentId, boarded: !wasBoarded }));
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'Scheduled': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'In-Progress': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
            case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-amber-500">Transit Logs</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Recording spatial displacements and entity attendance.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-neutral-900 p-1 rounded-md border border-slate-800/60 h-[42px]">
                        <button onClick={() => setFilterType('single')} className={`px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest rounded-md transition-all ${filterType === 'single' ? 'bg-amber-600/10 text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}>Snapshot</button>
                        <button onClick={() => setFilterType('range')} className={`px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest rounded-md transition-all ${filterType === 'range' ? 'bg-amber-600/10 text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}>Archive</button>
                    </div>

                    {filterType === 'single' ? (
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-neutral-900 border border-slate-800/60 rounded-md py-2.5 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all italic h-[42px]"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-neutral-900 border border-slate-800/60 rounded-md py-2.5 px-3 text-[11px] font-bold text-slate-200 focus:outline-none italic h-[42px]" />
                             <span className="text-slate-600 text-xs italic">TO</span>
                             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-neutral-900 border border-slate-800/60 rounded-md py-2.5 px-3 text-[11px] font-bold text-slate-200 focus:outline-none italic h-[42px]" />
                        </div>
                    )}

                    <button 
                        onClick={() => { resetForm(); setIsAddOpen(true); }}
                        className="px-6 py-4 bg-amber-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-amber-600/20 hover:shadow-amber-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none whitespace-nowrap h-[42px] sm:h-auto"
                    >
                        <Plus size={14} /> record transit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {tripLogs.length > 0 ? tripLogs.map((log) => (
                    <div key={log._id} className="bg-neutral-900 border border-slate-800/60 rounded-md overflow-hidden shadow-2xl group hover:border-amber-600/20 transition-all">
                        <div className="px-8 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase italic tracking-widest border ${log.type === 'Pickup' ? 'bg-amber-600/10 text-amber-500 border-amber-600/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
                                    {log.type} SEQUENCE
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter leading-none mb-1">{log.routeId?.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border w-fit ${getStatusColor(log.status)}`}>
                                            <Timer size={8} /> {log.status}
                                        </div>
                                        {log.status === 'Completed' && log.delayReason && (
                                            <span className="text-[8px] font-black text-rose-400 uppercase italic flex items-center gap-1"><AlertTriangle size={8} /> Internal Delay: {log.delayReason}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0"><Bus size={14} /></div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-[10px] font-black text-slate-300 uppercase italic leading-none">{log.vehicleId?.registrationNumber || 'N/A'}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase italic mt-0.5">Fleet Unit</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0"><User size={14} /></div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="text-[10px] font-black text-slate-300 uppercase italic leading-none">{log.driverId?.name || 'N/A'}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase italic mt-0.5">Operator</p>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 bg-neutral-950 border border-slate-800 rounded-md text-emerald-500 font-black italic text-[11px] tracking-tighter whitespace-nowrap">
                                    {log.attendance?.filter(a => a.boarded).length} / {log.attendance?.length} Boarded
                                </div>

                                <div className="flex items-center gap-3 ml-auto xl:ml-0">
                                    {log.status === 'Scheduled' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusTransition(log._id, log.status)}
                                                className="px-4 py-2 bg-sky-600 text-white text-[9px] font-black uppercase italic tracking-widest rounded-md shadow-lg shadow-sky-600/10 hover:bg-sky-700 transition-all flex items-center gap-2"
                                            >
                                                <Play size={10} /> initiate trip
                                            </button>
                                            <button onClick={() => handleCancelTrip(log._id, log.status)} className="p-2 text-rose-500 hover:bg-rose-500/10 border border-slate-800 rounded-md transition-all"><X size={14} /></button>
                                        </>
                                    )}
                                    {log.status === 'In-Progress' && (
                                        <button 
                                            onClick={() => handleStatusTransition(log._id, log.status)}
                                            className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase italic tracking-widest rounded-md shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={10} /> terminate trip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {log.attendance?.map((as, idx) => (
                                    <button 
                                        key={idx} 
                                        disabled={log.status !== 'In-Progress'}
                                        onClick={() => handleLiveBoarding(log._id, as.studentId?._id, as.boarded)}
                                        className={`p-4 rounded-md border transition-all flex items-center justify-between gap-3 text-left ${as.boarded ? 'bg-emerald-600/5 border-emerald-600/20' : 'bg-neutral-950 border-slate-800/60 opacity-60'} ${log.status === 'In-Progress' ? 'hover:scale-[1.02] cursor-pointer active:scale-95' : 'cursor-default'}`}
                                    >
                                        <div className="flex-1 overflow-hidden">
                                            <p className={`text-[11px] font-black uppercase italic tracking-tighter truncate ${as.boarded ? 'text-emerald-400' : 'text-slate-500'}`}>{as.studentId?.firstName} {as.studentId?.lastName}</p>
                                            <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                                <Clock size={8} className="text-slate-600" />
                                                <p className="text-[8px] font-bold uppercase italic truncate text-slate-600">
                                                    {as.boardingTime ? new Date(as.boardingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting...'}
                                                </p>
                                            </div>
                                        </div>
                                        {as.boarded ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-800"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center border border-slate-800 border-dashed rounded-md bg-neutral-900/40">
                        <ClipboardList size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                        <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-40">No transit logs archival detected for selected timestamp.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-2xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6 p-10">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Initialize Transit Sequence</h3>
                                    <div className="flex bg-neutral-950 p-1 rounded-md border border-slate-800">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, type: 'Pickup'})}
                                            className={`px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest rounded-md transition-all ${formData.type === 'Pickup' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Pickup
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, type: 'Dropoff'})}
                                            className={`px-4 py-1.5 text-[9px] font-black uppercase italic tracking-widest rounded-md transition-all ${formData.type === 'Dropoff' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Dropoff
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Mobility Matrix (Route)</label>
                                            <select 
                                                required
                                                value={formData.routeId}
                                                onChange={(e) => handleRouteChange(e.target.value)}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-amber-600/50 transition-all leading-none appearance-none"
                                            >
                                                <option value="">Select Vector Matrix...</option>
                                                {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 opacity-60">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Unit / Operator (Auto-Sync)</label>
                                            <div className="w-full bg-neutral-950/40 border border-slate-800/40 rounded-md py-3 px-4 text-[10px] font-black uppercase italic text-slate-500 truncate h-[42px] flex items-center">
                                                {formData.routeId ? `${vehicles.find(v => v._id === formData.vehicleId)?.registrationNumber} / ${drivers.find(d => d._id === formData.driverId)?.name}` : 'Awaiting Matrix Selection...'}
                                            </div>
                                        </div>
                                    </div>

                                    {formData.attendance.length > 0 && (
                                        <div className="pt-6 border-t border-slate-800/40">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 italic mb-6">Entity Attendance Matrix</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                {formData.attendance.map((as) => {
                                                    const route = routes.find(r => r._id === formData.routeId);
                                                    const studentInfo = route?.assignedStudents?.find(s => s.studentId?._id === as.studentId);
                                                    const name = studentInfo ? `${studentInfo.studentId.firstName} ${studentInfo.studentId.lastName}` : 'Unknown';
                                                    const stop = formData.type === 'Pickup' ? studentInfo?.pickupStop : studentInfo?.dropoffStop;

                                                    return (
                                                        <button 
                                                            key={as.studentId}
                                                            type="button"
                                                            onClick={() => toggleNewLogAttendance(as.studentId)}
                                                            className={`p-3 rounded-md border flex items-center justify-between text-left transition-all ${as.boarded ? 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400' : 'bg-neutral-950 border-slate-800 text-slate-600'}`}
                                                        >
                                                            <div className="overflow-hidden">
                                                                <p className="text-[10px] font-black uppercase italic tracking-tighter truncate">{name}</p>
                                                                <p className="text-[8px] font-bold uppercase italic opacity-60 truncate">{stop || 'No Stop'}</p>
                                                            </div>
                                                            {as.boarded ? <Check size={12} /> : <X size={12} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort sequence</button>
                                    <button 
                                        type="submit" 
                                        disabled={!formData.routeId}
                                        className="flex-1 px-6 py-4 bg-amber-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 leading-none hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        commit sequence log
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isDelayOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDelayOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-md rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={commitCompletion} className="p-8">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-6 pb-4 border-b border-slate-800/60 leading-none">Terminate Sequence</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Delay Rationale (Optional)</label>
                                        <textarea 
                                            value={delayReason}
                                            onChange={(e) => setDelayReason(e.target.value)}
                                            placeholder="Specify reason for spatial delay if any..."
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-600/50 transition-all italic min-h-[100px]"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setIsDelayOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Discard</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-emerald-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 leading-none">Finalize Archive</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TripLogs;
