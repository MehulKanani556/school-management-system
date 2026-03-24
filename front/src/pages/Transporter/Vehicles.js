import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, addVehicleSlice, updateVehicleSlice, deleteVehicleSlice, fetchDriversSlice, addMaintenanceSlice, clearTransportMessage } from '../../redux/slice/transport.slice';
import { Bus, Search, Plus, Trash2, Edit3, User, Loader2, Gauge, CheckCircle2, AlertTriangle, Disc, Fuel, Calendar, Wrench, Info, History, ShieldAlert, DollarSign, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Vehicles = () => {
    const dispatch = useDispatch();
    const { vehicles, drivers, loading, message, error } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = React.useState(false);
    const [selectedVehicle, setSelectedVehicle] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    
    const [formData, setFormData] = React.useState({ 
        registrationNumber: '', 
        capacity: 40, 
        driverId: '',
        status: 'active',
        fuelType: 'Diesel',
        insuranceExpiry: '',
        lastServiceDate: ''
    });

    const [maintenanceFormData, setMaintenanceFormData] = React.useState({
        serviceType: '',
        cost: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchDriversSlice());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            setIsAddOpen(false);
            setIsEditOpen(false);
            setIsMaintenanceOpen(false);
            resetForm();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetForm = () => {
        setFormData({ 
            registrationNumber: '', 
            capacity: 40, 
            driverId: '',
            status: 'active',
            fuelType: 'Diesel',
            insuranceExpiry: '',
            lastServiceDate: ''
        });
        setSelectedVehicle(null);
    }

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addVehicleSlice(formData));
    }

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateVehicleSlice({ id: selectedVehicle._id, data: formData }));
    }

    const handleMaintenance = (e) => {
        e.preventDefault();
        dispatch(addMaintenanceSlice({ id: selectedVehicle._id, data: maintenanceFormData }));
    }

    const openEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            registrationNumber: vehicle.registrationNumber,
            capacity: vehicle.capacity,
            driverId: vehicle.driverId?._id || '',
            status: vehicle.status || 'active',
            fuelType: vehicle.fuelType || 'Diesel',
            insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
            lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toISOString().split('T')[0] : ''
        });
        setIsEditOpen(true);
    }

    const openMaintenance = (vehicle) => {
        setSelectedVehicle(vehicle);
        setMaintenanceFormData({
            serviceType: '',
            cost: '',
            notes: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsMaintenanceOpen(true);
    }

    const isExpiringSoon = (date) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diff = expiry - today;
        return diff < 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    const handleDelete = (id) => {
        if (window.confirm('Decommission this vehicle node?')) {
            dispatch(deleteVehicleSlice(id));
        }
    }

    const filteredVehicles = vehicles.filter(v => 
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch(status) {
            case 'active': return 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500';
            case 'maintenance': return 'bg-orange-600/10 border-orange-600/20 text-orange-500';
            case 'inactive': return 'bg-red-600/10 border-red-600/20 text-red-500';
            default: return 'bg-slate-600/10 border-slate-600/20 text-slate-500';
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-orange-500">Fleet Inventory</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping organizational mobility units.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-neutral-950 border border-slate-800/60 rounded-md py-2.5 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all w-full sm:w-64 italic"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-950/60 text-slate-500 border-b border-slate-800/60">
                            <tr>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic">Unit Core</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic">Node Custodian</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic">Specifications</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic">Status Logic</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest italic">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
                                <tr key={vehicle._id} className="group/row hover:bg-neutral-950/60 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-orange-500 group-hover/row:border-orange-600/40 transition-all duration-500 shadow-xl">
                                                <Bus size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-100 uppercase italic tracking-tighter leading-none mb-1">{vehicle.registrationNumber}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase italic tracking-widest">{vehicle.fuelType || 'DIESEL'}</span>
                                                    {isExpiringSoon(vehicle.insuranceExpiry) && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase italic animate-pulse">
                                                            <ShieldAlert size={8} /> Insurance Alert
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-200 tracking-tighter italic uppercase leading-none mb-1">{vehicle.driverId?.name || 'NODE NOT ASSIGNED'}</span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase italic opacity-60 tracking-widest">{vehicle.driverId?.contact || 'PROTO-NONE'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-200 tracking-tighter">{vehicle.capacity}</span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Max Load</span>
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-500 italic opacity-60">
                                                Last SVC: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-md italic ${getStatusStyles(vehicle.status || 'active')}`}> 
                                            {vehicle.status || 'Operational'} 
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center gap-3 justify-end opacity-0 group-hover/row:opacity-100 transition-all">
                                            <button 
                                                onClick={() => openMaintenance(vehicle)}
                                                className="p-2.5 text-slate-500 hover:text-emerald-500 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-emerald-600/10"
                                                title="Log Maintenance"
                                            >
                                                <Wrench size={16} />
                                            </button>
                                            <button 
                                                onClick={() => openEdit(vehicle)}
                                                className="p-2.5 text-slate-500 hover:text-orange-500 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-orange-600/10"
                                            >
                                                <Edit3 size={16} />
                                            </button>
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

            {/* Vehicle Modal */}
            <AnimatePresence>
                {(isAddOpen || isEditOpen) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-2xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={isEditOpen ? handleEdit : handleAdd} className="p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">
                                    {isEditOpen ? 'Update mobility unit' : 'Provision new mobility unit'}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Registration Identifier</label>
                                        <input type="text" required value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Propulsion Matrix (Fuel)</label>
                                        <select value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none appearance-none">
                                            <option value="Diesel">DIESEL</option>
                                            <option value="Petrol">PETROL</option>
                                            <option value="Electric">ELECTRIC</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Max Entity Capacity</label>
                                        <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Unit Operational Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none appearance-none">
                                            <option value="active">ACTIVE</option>
                                            <option value="maintenance">MAINTENANCE</option>
                                            <option value="inactive">INACTIVE</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Insurance Expiry Vector</label>
                                        <input type="date" value={formData.insuranceExpiry} onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Node Custodian (Driver)</label>
                                        <select value={formData.driverId} onChange={(e) => setFormData({...formData, driverId: e.target.value})} className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic leading-none appearance-none">
                                            <option value="">SELECT CUSTODIAN</option>
                                            {drivers.map(driver => (
                                                <option key={driver._id} value={driver._id}>{driver.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Abort Logic</button>
                                    <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-orange-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 leading-none disabled:opacity-50">
                                        {loading ? 'Synthesizing' : isEditOpen ? 'Update Protocol' : 'Finalize Provision'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Maintenance History Modal */}
            <AnimatePresence>
                {isMaintenanceOpen && selectedVehicle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMaintenanceOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-slate-800/60 bg-neutral-950/40 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Maintenance Ledger</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mt-1">{selectedVehicle.registrationNumber}</p>
                                </div>
                                <button onClick={() => setIsMaintenanceOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <form onSubmit={handleMaintenance} className="lg:col-span-1 space-y-5 bg-neutral-950/40 p-6 rounded-md border border-slate-800/60">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 italic mb-4 flex items-center gap-2"><Plus size={12} /> Log New Protocol</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-600 italic">SVC Type</label>
                                                <input type="text" required value={maintenanceFormData.serviceType} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, serviceType: e.target.value})} placeholder="e.g. Engine Calibration" className="w-full bg-neutral-900 border border-slate-800 rounded-md py-2 px-3 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-600 italic">Resource Allocation (Cost)</label>
                                                <input type="number" required value={maintenanceFormData.cost} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, cost: e.target.value})} className="w-full bg-neutral-900 border border-slate-800 rounded-md py-2 px-3 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-600 italic">Timeline (Date)</label>
                                                <input type="date" required value={maintenanceFormData.date} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, date: e.target.value})} className="w-full bg-neutral-900 border border-slate-800 rounded-md py-2 px-3 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase text-slate-600 italic">Logic Logs (Notes)</label>
                                                <textarea rows="3" value={maintenanceFormData.notes} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, notes: e.target.value})} className="w-full bg-neutral-900 border border-slate-800 rounded-md py-2 px-3 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-orange-600/50 transition-all italic" />
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full py-3 bg-orange-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/10">Commit Log</button>
                                        </div>
                                    </form>

                                    <div className="lg:col-span-2 space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic flex items-center gap-2"><History size={12} /> Execution History</h4>
                                        <div className="space-y-4">
                                            {selectedVehicle.maintenanceHistory?.length > 0 ? [...selectedVehicle.maintenanceHistory].reverse().map((log, idx) => (
                                                <div key={idx} className="bg-neutral-950/40 border border-slate-800/60 p-5 rounded-md flex justify-between items-start group">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-neutral-900 border border-slate-800 text-orange-500 rounded"><FileText size={14} /></div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-slate-100 uppercase italic tracking-tighter">{log.serviceType}</p>
                                                                <p className="text-[9px] font-bold text-slate-600 uppercase italic">{new Date(log.date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 italic px-1">{log.notes}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[12px] font-black text-slate-200">${log.cost}</p>
                                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mt-1">ALLOCATED</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-20 opacity-20 italic font-black uppercase text-[10px] tracking-widest grayscale">No protocol history detected in local buffers.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Vehicles;
