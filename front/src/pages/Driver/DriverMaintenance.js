import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriverProfileSlice, reportDriverIssueSlice } from '../../redux/slice/transport.slice';
import { Wrench, Bus, AlertTriangle, Send, History, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DriverMaintenance = () => {
    const dispatch = useDispatch();
    const { driverVehicle, loading } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        vehicleId: '',
        title: '',
        description: '',
        priority: 'Medium'
    });

    useEffect(() => {
        dispatch(fetchDriverProfileSlice());
    }, [dispatch]);

    useEffect(() => {
        if (driverVehicle) {
            setFormData(prev => ({ ...prev, vehicleId: driverVehicle._id }));
        }
    }, [driverVehicle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(reportDriverIssueSlice(formData))
            .then(() => {
                toast.success('Bus problem reported! (बस की शिकायत दर्ज की गई)');
                setIsAddOpen(false);
                setFormData({ vehicleId: driverVehicle?._id || '', title: '', description: '', priority: 'Medium' });
            });
    }

    const maintenanceLogs = driverVehicle?.maintenanceHistory || [];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2 text-slate-100 italic">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-emerald-500 font-outfit">Complain / Fix Bus</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Report any bus problem or issue here. (बस की शिकायत और मरम्मत)</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-6 py-4 bg-emerald-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md transition-all flex items-center gap-2 group leading-none h-[42px] hover:bg-emerald-500"
                    >
                        <Wrench size={14} /> New Report (नई शिकायत दर्ज करें)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all font-outfit">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-[0.2em] mb-8 flex items-center gap-3">
                        <History size={16} className="text-emerald-500" /> Recent Problems Reported
                    </h3>
                    <div className="space-y-4">
                        {maintenanceLogs.length > 0 ? maintenanceLogs.map((log, i) => (
                            <div key={i} className="flex flex-col p-4 bg-neutral-950 border border-slate-800/40 rounded italic group hover:border-emerald-500/20 transition-all gap-2">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded bg-neutral-900 border ${log.status === 'Completed' ? 'text-emerald-500 border-emerald-500/10' : 'text-orange-500 border-orange-500/10'}`}>
                                            <Wrench size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-200 uppercase tracking-tighter">{log.title}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Date: {new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${log.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>{log.status}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 opacity-60 italic">{log.description}</p>
                            </div>
                        )) : (
                            <div className="py-20 text-center border border-slate-800 border-dashed rounded-md bg-neutral-900/10">
                                <History size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                                <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-60">No problems reported yet. (कोई शिकायत नहीं मिली है)</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-600/30 transition-all font-outfit">
                    <h3 className="text-sm font-black text-slate-100 uppercase italic tracking-[0.2em] mb-8 flex items-center gap-3">
                        <AlertTriangle size={16} className="text-orange-500" /> Maintenance Guide (नियम)
                    </h3>
                    <div className="space-y-4">
                        <p className="text-[11px] text-slate-400 italic">Please report if you find anything wrong with:</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Brakes & Clutch', desc: 'ब्रेक और क्लच' },
                                { label: 'Engine Problems', desc: 'इंजन की समस्या' },
                                { label: 'Tire Condition', desc: 'टायर' },
                                { label: 'Lights & Indicators', desc: 'लाइट और इंडिकेटर' },
                                { label: 'Bus Cleaning', desc: 'बस की सफाई' },
                                { label: 'Safety First', desc: 'सुरक्षा सर्वोपरि' }
                            ].map((v, i) => (
                                <div key={i} className="p-3 bg-neutral-950 border border-emerald-500/10 rounded flex flex-col italic border-dashed group-hover:border-emerald-500/30 transition-all">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase">{v.label}</p>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={handleSubmit} className="p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Report Bus Issue (शिकायत दर्ज करें)</h3>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Assigned Bus (आपकी बस)</label>
                                        <div className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-emerald-500/80 leading-none">
                                            {driverVehicle?.registrationNumber || 'No Bus Assigned'}
                                        </div>
                                        <input type="hidden" value={formData.vehicleId} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Issue Title (शिकायत क्या है?)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Example: Engine making noise"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all italic leading-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Describe in Detail (जानकारी लिखें)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Tell us everything about the problem..."
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all italic min-h-[100px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Priority (कितना जरूरी है?)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Low', 'Medium', 'High'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: p })}
                                                    className={`py-3 text-[9px] font-black uppercase italic tracking-widest rounded-md border transition-all ${formData.priority === p ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-neutral-950 border-slate-800 text-slate-600'}`}
                                                >
                                                    {p === 'High' ? 'Urgent' : p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-emerald-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 leading-none hover:translate-y-[-2px]">
                                        {loading ? 'Sending...' : 'Report Problem (शिकायत भेजें)'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DriverMaintenance;
