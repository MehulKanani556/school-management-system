import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, addVehicleSlice, deleteVehicleSlice } from '../../redux/slice/transport.slice';
import { Bus, Search, Plus, Trash2, Edit3, User, Loader2, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vehicles = () => {
    const dispatch = useDispatch();
    const { vehicles, loading, success } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({ registrationNumber: '', capacity: 40, driverName: '', driverContact: '' });

    useEffect(() => {
        dispatch(fetchVehicles());
    }, [dispatch, success]);

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addVehicleSlice(formData));
        setIsAddOpen(false);
    }

    const handleDelete = (id) => {
        if (window.confirm('Decommission this vehicle node?')) {
            dispatch(deleteVehicleSlice(id));
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-orange-500">Fleet Inventory</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping organizational mobility units.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="px-6 py-4 bg-orange-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> add vehicle
                </button>
            </div>

            <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-slate-800/60 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none font-outfit">Unit Inventory</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Identify Unit Number..." 
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2.5 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-950/50 border-b border-slate-800/60">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Vehicle Identifier</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Node Custodian (Driver)</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-center">Entity Capacity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Status Link</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {vehicles.length > 0 ? vehicles.map((vehicle, i) => (
                                <tr key={i} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800/60 overflow-hidden flex items-center justify-center text-slate-600 shadow-inner group-hover/row:border-orange-600/30 transition-all shadow-xl shadow-orange-950/5">
                                                <Bus size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight leading-none mb-1.5 group-hover/row:text-orange-500 transition-all uppercase font-outfit">{vehicle.registrationNumber}</span>
                                                <span className="text-[10px] text-slate-500 uppercase italic opacity-60">Mobility Node UNIT-0{i+1}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1">{vehicle.driverName || 'NODE NOT ASSIGNED'}</span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{vehicle.driverContact || 'PROTO-NONE'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-slate-100 italic uppercase leading-none mb-1 font-outfit tracking-tighter">{vehicle.capacity}</span>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Max Load</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic bg-emerald-600/10 border-emerald-600/20 text-emerald-500`}> Operational </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center gap-3 justify-end opacity-0 group-hover/row:opacity-100 transition-all">
                                            <button className="p-2.5 text-slate-500 hover:text-orange-500 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-orange-600/10"><Edit3 size={16} /></button>
                                            <button 
                                                onClick={() => handleDelete(vehicle._id)}
                                                className="p-2.5 text-slate-500 hover:text-red-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-red-600/10"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">Fleet inventory synchronization required... no units detected.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleAdd} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Add mobility unit</h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Unit Identifier (Plate No)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Max Entity Capacity</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="1"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Node Custodian (Driver Name)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.driverName}
                                            onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Custodian Signal (Contact)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.driverContact}
                                            onChange={(e) => setFormData({...formData, driverContact: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort unit</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-orange-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 leading-none shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:translate-y-[-2px]">provision unit</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Vehicles;
