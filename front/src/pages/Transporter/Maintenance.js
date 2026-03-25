import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, addMaintenanceSlice, addFuelLogSlice, addInsuranceRenewalSlice, clearTransportMessage } from '../../redux/slice/transport.slice';
import {
    Wrench, Fuel, ShieldCheck, History, TrendingUp,
    Plus, Search, Bus, Calendar, DollarSign,
    Gauge, Info, FileText, AlertTriangle,
    ChevronRight, ChevronDown, CheckCircle2,
    Clock, Tool
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Maintenancetransport = () => {
    const dispatch = useDispatch();
    const { vehicles, loading, message, error } = useSelector((state) => state.transport);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('summary'); // summary, maintenance, fuel, insurance
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState('maintenance'); // maintenance, fuel, insurance

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        serviceType: '',
        cost: '',
        notes: '',
        fuelQuantity: '',
        odometerReading: '',
        renewalDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        amount: '',
        policyNumber: '',
        provider: ''
    });

    useEffect(() => {
        dispatch(fetchVehicles());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            setIsAddModalOpen(false);
            resetFormData();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetFormData = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            serviceType: '',
            cost: '',
            notes: '',
            fuelQuantity: '',
            odometerReading: '',
            renewalDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            amount: '',
            policyNumber: '',
            provider: ''
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedVehicleId) return toast.error('Identify target mobility unit');

        if (modalType === 'maintenance') {
            dispatch(addMaintenanceSlice({
                id: selectedVehicleId, data: {
                    serviceType: formData.serviceType,
                    cost: parseFloat(formData.cost),
                    notes: formData.notes,
                    date: formData.date
                }
            }));
        } else if (modalType === 'fuel') {
            dispatch(addFuelLogSlice({
                id: selectedVehicleId, data: {
                    fuelQuantity: parseFloat(formData.fuelQuantity),
                    cost: parseFloat(formData.cost),
                    odometerReading: parseFloat(formData.odometerReading),
                    notes: formData.notes,
                    date: formData.date
                }
            }));
        } else if (modalType === 'insurance') {
            dispatch(addInsuranceRenewalSlice({
                id: selectedVehicleId, data: {
                    renewalDate: formData.renewalDate,
                    expiryDate: formData.expiryDate,
                    amount: parseFloat(formData.amount),
                    policyNumber: formData.policyNumber,
                    provider: formData.provider
                }
            }));
        }
    }

    const filteredVehicles = vehicles.filter(v =>
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAddModal = (type, vId = '') => {
        setModalType(type);
        setSelectedVehicleId(vId);
        setIsAddModalOpen(true);
    }

    const calculateFuelEfficiency = (vehicle) => {
        if (!vehicle.fuelLogs || vehicle.fuelLogs.length < 2) return 'N/A';
        const sortedLogs = [...vehicle.fuelLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
        const totalFuel = sortedLogs.slice(1).reduce((acc, log) => acc + log.fuelQuantity, 0);
        const distance = sortedLogs[sortedLogs.length - 1].odometerReading - sortedLogs[0].odometerReading;
        if (totalFuel === 0) return 'N/A';
        return (distance / totalFuel).toFixed(2) + ' km/l';
    }

    const isExpiringSoon = (date) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diff = expiry - today;
        return diff < 30 * 24 * 60 * 60 * 1000;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20 max-w-[1600px] mx-auto font-outfit">
            {/* Header */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 px-2">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 leading-none text-transporter-primary">Maintenance & Fuel Ledger</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping fuel allocation, hardware integrity, and temporal coverage protocols.</p>
                </div>

                <div className="flex bg-neutral-900/50 p-1 rounded-md border border-slate-800/60 shadow-2xl">
                    {[
                        { id: 'summary', icon: TrendingUp, label: 'Analytics' },
                        { id: 'maintenance', icon: Wrench, label: 'Service History' },
                        { id: 'fuel', icon: Fuel, label: 'Fuel Matrix' },
                        { id: 'insurance', icon: ShieldCheck, label: 'Insurance' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-transporter-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Quick Actions & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                        type="text"
                        placeholder="Scan Mobility Units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-900 border border-slate-800 h-14 pl-12 pr-6 rounded-md text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-transporter-primary/50 transition-all italic"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => openAddModal('maintenance')} className="flex-1 md:w-auto px-6 py-4 bg-transporter-primary/10 text-transporter-primary border border-transporter-primary/30 rounded-md text-[10px] font-black uppercase tracking-widest italic hover:bg-transporter-primary hover:text-white transition-all shadow-xl leading-none">Log Service</button>
                    <button onClick={() => openAddModal('fuel')} className="flex-1 md:w-auto px-6 py-4 bg-blue-600/10 text-blue-500 border border-blue-600/30 rounded-md text-[10px] font-black uppercase tracking-widest italic hover:bg-blue-600 hover:text-white transition-all shadow-xl leading-none">Log Fuel</button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-10">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {filteredVehicles.map(vehicle => (
                            <motion.div key={vehicle._id} whileHover={{ y: -5 }} className="bg-neutral-900 border border-slate-800/60 rounded-md p-8 space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Bus size={100} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-transporter-primary">
                                        <Bus size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 leading-none mb-1">{vehicle.registrationNumber}</h3>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none italic">{vehicle.driverId?.name || 'NODE UNASSIGNED'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-neutral-950 border border-slate-800/40 rounded-md">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Fuel cost</p>
                                        <div className="flex items-center gap-2 text-blue-500">
                                            <Fuel size={14} />
                                            {/* <span className="text-sm font-black italic uppercase">{calculateFuelEfficiency(vehicle)}</span> */}
                                            <span className="text-sm font-black italic uppercase">${vehicle.maintenanceHistory?.reduce((acc, log) => acc + (log.cost || 0), 0).toFixed(2) || '0.00'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-neutral-950 border border-slate-800/40 rounded-md">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Integrity Status</p>
                                        <div className="flex items-center gap-2 text-transporter-primary">
                                            <Wrench size={14} />
                                            <span className="text-sm font-black italic uppercase">{vehicle.status || 'Active'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-800/40">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Insurance Matrix</span>
                                        <span className={`text-[9px] font-black italic uppercase ${isExpiringSoon(vehicle.insuranceExpiry) ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                                            EXP: {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'VOID'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Hardware Protocol</span>
                                        <span className="text-[9px] font-black italic text-slate-300 uppercase">
                                            SVC: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'VOID'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'maintenance' && (
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-950 text-slate-500 border-b border-slate-800/60">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Temporal Node</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Mobility Unit</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Service Protocol</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Allocated Resources</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Integrity Logs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {vehicles.flatMap(v => v.maintenanceHistory.map(log => ({ ...log, reg: v.registrationNumber, vId: v._id }))).sort((a, b) => new Date(b.date) - new Date(a.date)).map((log, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-950/60 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-200 uppercase italic">{new Date(log.date).toLocaleDateString()}</span>
                                                <span className="text-[8px] font-bold text-slate-600 uppercase italic mt-1">{new Date(log.date).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-transporter-primary uppercase italic tracking-tighter">{log.reg}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-950 border border-slate-800 rounded group-hover:border-transporter-primary/30 transition-all text-orange-500"><Wrench size={14} /></div>
                                                <span className="text-xs font-black text-slate-200 uppercase italic">{log.serviceType}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white italic tracking-tighter">${log.cost}</span>
                                                <span className="text-[8px] font-black text-slate-600 uppercase italic">RESOURCES EXPENDED</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] text-slate-500 italic max-w-xs">{log.notes || 'No meta logs attached.'}</p>
                                        </td>
                                    </tr>
                                ))}
                                {vehicles.every(v => v.maintenanceHistory.length === 0) && (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center opacity-30 italic font-black uppercase text-xs tracking-[0.2em]">Void integrity buffers. No service history detected.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'fuel' && (
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-950 text-slate-500 border-b border-slate-800/60">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Allocation Node</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Mobility Unit</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Resource Matrix</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Odometer (KM)</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Cost Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {vehicles.flatMap(v => (v.fuelLogs || []).map(log => ({ ...log, reg: v.registrationNumber, vId: v._id }))).sort((a, b) => new Date(b.date) - new Date(a.date)).map((log, idx) => (
                                    <tr key={idx} className="hover:bg-neutral-950/60 transition-all group">
                                        <td className="px-8 py-6 text-[11px] font-black text-slate-200 uppercase italic">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-blue-500 uppercase italic tracking-tighter">{log.reg}</span>
                                        </td>
                                        <td className="px-8 py-6 italic">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-neutral-950 border border-slate-800 rounded group-hover:border-blue-500/30 transition-all text-blue-500"><Fuel size={14} /></div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-200">{log.fuelQuantity} LTRS</span>
                                                    <span className="text-[8px] font-bold text-slate-600 italic uppercase">Logistics Matrix</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-white italic">{log.odometerReading} <span className="text-slate-600 text-[10px]">KM</span></td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-200 italic tracking-tighter">${log.cost}</span>
                                                <span className="text-[8px] font-black text-slate-600 uppercase italic">UNIT RATE APPLIED</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {vehicles.every(v => !v.fuelLogs || v.fuelLogs.length === 0) && (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center opacity-30 italic font-black uppercase text-xs tracking-[0.2em]">Void resource allocation. No fuel logs detected.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'insurance' && (
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-950 text-slate-500 border-b border-slate-800/60">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Unit Node</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Policy Protocol</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Provider Entity</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest italic">Temporal Matrix</th>
                                    <th className="px-8 py-5 text-right text-[9px] font-black uppercase tracking-widest italic">Status Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {vehicles.map(vehicle => (
                                    <tr key={vehicle._id} className="hover:bg-neutral-950/60 transition-all group">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors"><ShieldCheck size={20} /></div>
                                                <span className="text-xs font-black text-slate-100 uppercase italic">{vehicle.registrationNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 font-black text-slate-400 italic text-xs tracking-widest">{vehicle.insuranceRenewals?.[0]?.policyNumber || 'UNLINKED PROTOCOL'}</td>
                                        <td className="px-8 py-7 font-black text-slate-400 italic text-[10px] tracking-widest uppercase">{vehicle.insuranceRenewals?.[0]?.provider || 'VOID SECTOR'}</td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <span className="text-[10px] font-black italic">{vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'N/A'}</span>
                                                    <ChevronRight size={10} className="text-slate-700" />
                                                    <span className="text-[10px] font-bold text-slate-600 italic">NEXT SYNC</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <span className={`px-4 py-1.5 rounded-md border text-[9px] font-black uppercase tracking-widest italic ${isExpiringSoon(vehicle.insuranceExpiry) ? 'bg-red-600/10 border-red-600/30 text-red-500' : 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500'}`}>
                                                {isExpiringSoon(vehicle.insuranceExpiry) ? 'CRITICAL EXPIRY' : 'SYNC SECURED'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Maintenance/Fuel Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-neutral-900 w-full max-w-xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-12 space-y-8">
                                <div className="space-y-3">
                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center border ${modalType === 'fuel' ? 'bg-blue-600/10 border-blue-600/30 text-blue-500' : 'bg-transporter-primary/10 border-transporter-primary/30 text-transporter-primary'}`}>
                                        {modalType === 'fuel' ? <Fuel size={24} /> : <Wrench size={24} />}
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-100 leading-none">Log {modalType === 'fuel' ? 'Fuel Allocation' : 'Hardware Protocol'}</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none opacity-60">Provisioning new temporal node metadata into central ledger.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Target Mobility Unit</label>
                                        <select
                                            required
                                            value={selectedVehicleId}
                                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                                            className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-100 focus:outline-none focus:border-transporter-primary/50 appearance-none leading-none"
                                        >
                                            <option value="">Scan Fleet Network...</option>
                                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Execution Time (Date)</label>
                                            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Resource Cost ($)</label>
                                            <input type="number" required value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-300" />
                                        </div>
                                    </div>

                                    {modalType === 'maintenance' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Service Sector Type</label>
                                            <input type="text" required placeholder="e.g. CORE CALIBRATION" value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-100" />
                                        </div>
                                    )}

                                    {modalType === 'fuel' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Quantity (LTRS)</label>
                                                <input type="number" required value={formData.fuelQuantity} onChange={(e) => setFormData({ ...formData, fuelQuantity: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-100 placeholder:text-slate-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Odometer Reading</label>
                                                <input type="number" required value={formData.odometerReading} onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md py-4 px-6 text-[11px] font-black uppercase italic text-slate-100 placeholder:text-slate-800" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Execution Metadata (Notes)</label>
                                        <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-neutral-950 border border-slate-800 rounded-md p-6 text-[11px] font-black uppercase italic text-slate-100 placeholder:text-slate-800 resize-none" placeholder="APPEND LOGS..."></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-md">Abort</button>
                                    <button type="submit" disabled={loading} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md transition-all shadow-xl leading-none ${modalType === 'fuel' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-transporter-primary shadow-transporter-primary/20'}`}>
                                        {loading ? 'SYNERGIZING...' : 'COMMIT LOG'}
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

export default Maintenancetransport;
