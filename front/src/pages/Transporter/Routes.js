import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutesSlice, addRouteSlice, deleteRouteSlice, fetchVehicles } from '../../redux/slice/transport.slice';
import { Navigation, Plus, MapPin, Trash2, Edit3, Bus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Routes = () => {
    const dispatch = useDispatch();
    const { routes, vehicles, loading, success } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({ name: '', vehicleId: '', stops: [] });
    const [newStop, setNewStop] = React.useState({ name: '', order: 1, estimatedTime: '08:00 AM' });

    useEffect(() => {
        dispatch(fetchRoutesSlice());
        dispatch(fetchVehicles());
    }, [dispatch, success]);

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addRouteSlice(formData));
        setIsAddOpen(false);
    }

    const addStop = () => {
        setFormData({ ...formData, stops: [...formData.stops, { ...newStop, order: formData.stops.length + 1 }] });
        setNewStop({ name: '', order: formData.stops.length + 2, estimatedTime: '08:00 AM' });
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-blue-500 font-outfit">Route Matrix</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping logical transit paths across the sector.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="px-6 py-4 bg-blue-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group"
                >
                    <Plus size={14} /> generate matrix
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {routes.length > 0 ? routes.map((route, i) => (
                    <div key={i} className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 shadow-2xl group hover:border-blue-600/30 transition-all">
                        <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-800/40 font-outfit">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-neutral-950 border border-slate-800 rounded-md text-blue-500"><Navigation size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-200 uppercase italic tracking-tighter leading-none mb-1.5">{route.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase italic opacity-60 tracking-widest">
                                        Assigned: {route.vehicleId?.registrationNumber || 'NO UNIT SYNCED'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => dispatch(deleteRouteSlice(route._id))}
                                className="p-2.5 text-slate-600 hover:text-red-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-red-600/10"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mb-4">Logic Nodes (Stops)</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {route.stops.sort((a,b) => a.order - b.order).map((stop, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group/stop">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                                            {idx !== route.stops.length - 1 && <div className="w-px h-10 bg-slate-800/80 my-1"></div>}
                                        </div>
                                        <div className="flex-1 bg-neutral-950/40 p-3 rounded-md border border-slate-800/60 group-hover/stop:border-blue-600/20 transition-all flex justify-between items-center">
                                            <div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase italic leading-none mb-1">{stop.name}</p>
                                                <p className="text-[9px] font-bold text-slate-600 uppercase italic opacity-60 leading-none">ORDER_POINT-0{stop.order}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black italic text-blue-400 opacity-80 leading-none">{stop.estimatedTime}</p>
                                                <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">EST_WINDOW</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {route.stops.length === 0 && <p className="text-[10px] font-black uppercase text-slate-700 italic border border-slate-800/40 border-dashed p-10 rounded-md text-center">No logic nodes mapped for this matrix.</p>}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="xl:col-span-2 p-20 border border-slate-800 border-dashed rounded-md text-center bg-neutral-900/40">
                         <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-40">No route matrices detected in sector memory.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleAdd} className="space-y-6 p-10 font-outfit">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Generate route matrix</h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Matrix Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Assigned Fleet Unit</label>
                                        <select 
                                            required
                                            value={formData.vehicleId}
                                            onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-blue-600/50 transition-all leading-none"
                                        >
                                            <option value="">Sync Unit...</option>
                                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} ({v.driverName})</option>)}
                                        </select>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800/40">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-6">Logic Node Mapping</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                            <input 
                                                type="text" 
                                                placeholder="NODE NAME"
                                                value={newStop.name}
                                                onChange={(e) => setNewStop({...newStop, name: e.target.value})}
                                                className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 px-3 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="TEMPORAL SYNC"
                                                value={newStop.estimatedTime}
                                                onChange={(e) => setNewStop({...newStop, estimatedTime: e.target.value})}
                                                className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 px-3 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40"
                                            />
                                            <button 
                                                type="button"
                                                onClick={addStop}
                                                className="bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-md text-[9px] font-black uppercase tracking-widest py-2 hover:bg-blue-600 hover:text-white transition-all italic leading-none"
                                            >
                                                add node
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.stops.map((s, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-neutral-950/60 rounded-md border border-slate-800/40">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">{s.order}. {s.name}</span>
                                                    <span className="text-[9px] font-bold text-blue-500 italic">{s.estimatedTime}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort matrix</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 leading-none">commit matrix</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Routes;
