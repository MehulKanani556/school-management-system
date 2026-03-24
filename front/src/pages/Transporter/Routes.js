import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutesSlice, addRouteSlice, updateRouteSlice, deleteRouteSlice, fetchVehicles, clearTransportMessage, fetchTransportApplicantsSlice, assignStudentSlice, unassignStudentSlice } from '../../redux/slice/transport.slice';
import { Navigation, Plus, MapPin, Trash2, Edit3, Bus, Loader2, X, Users, Activity, Crosshair, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Map component for picking coordinates
const StopPickerMap = ({ onPick, stops = [] }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng);
        },
    });

    return (
        <>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
            />
            {stops.map((stop, idx) => (
                stop.lat && stop.lng && (
                    <Marker 
                        key={idx} 
                        position={[stop.lat, stop.lng]} 
                        icon={L.divIcon({
                            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
                            className: 'custom-marker',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })}
                    />
                )
            ))}
        </>
    );
};

const Routes = () => {
    const dispatch = useDispatch();
    const { routes, vehicles, applicants, loading, message, error } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isAssignOpen, setIsAssignOpen] = React.useState(false);
    const [selectedRoute, setSelectedRoute] = React.useState(null);
    const [selectedRouteForAssign, setSelectedRouteForAssign] = React.useState(null);
    const [formData, setFormData] = React.useState({ name: '', vehicleId: '', stops: [], status: 'active', fee: 0 });
    const [newStop, setNewStop] = React.useState({ name: '', order: 1, estimatedTime: '08:00 AM', lat: null, lng: null });
    const [assignData, setAssignData] = React.useState({ studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });

    useEffect(() => {
        dispatch(fetchRoutesSlice());
        dispatch(fetchVehicles());
        dispatch(fetchTransportApplicantsSlice());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            setIsAddOpen(false);
            setIsEditOpen(false);
            setIsAssignOpen(false);
            resetForm();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetForm = () => {
        setFormData({ name: '', vehicleId: '', stops: [], status: 'active', fee: 0 });
        setNewStop({ name: '', order: 1, estimatedTime: '08:00 AM', lat: null, lng: null });
        setSelectedRoute(null);
        setAssignData({ studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
    }

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addRouteSlice(formData));
    }

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateRouteSlice({ id: selectedRoute._id, data: formData }));
    }

    const handleAssign = (e) => {
        e.preventDefault();
        if (!assignData.studentId || !selectedRouteForAssign) return toast.error('Selection metadata incomplete');
        dispatch(assignStudentSlice({ routeId: selectedRouteForAssign._id, data: assignData }));
    }

    const handleUnassign = (studentId) => {
        if (window.confirm('Strike student from manifest? Billing protocols remain active.')) {
            dispatch(unassignStudentSlice({ routeId: selectedRouteForAssign._id, studentId }));
        }
    }

    const openAssign = (route) => {
        setSelectedRouteForAssign(route);
        // Pre-fill stops if possible
        const defaultPickup = route.stops[0]?.name || '';
        const defaultDropoff = route.stops[route.stops.length - 1]?.name || '';
        setAssignData({ studentId: '', pickupStop: defaultPickup, dropoffStop: defaultDropoff, seatNumber: '' });
        setIsAssignOpen(true);
    }

    const toggleStatus = (route) => {
        const newStatus = route.status === 'active' ? 'inactive' : 'active';
        dispatch(updateRouteSlice({ id: route._id, data: { status: newStatus } }));
    }

    const openEdit = (route) => {
        setSelectedRoute(route);
        setFormData({
            name: route.name,
            vehicleId: route.vehicleId?._id || '',
            stops: [...route.stops],
            status: route.status || 'active',
            fee: route.fee || 0
        });
        setIsEditOpen(true);
    }

    const addStop = () => {
        if (!newStop.name) return toast.error('Node identifier required');
        if (!newStop.lat || !newStop.lng) return toast.error('Select location on map');
        
        const order = formData.stops.length + 1;
        setFormData({ ...formData, stops: [...formData.stops, { ...newStop, order }] });
        setNewStop({ name: '', order: order + 1, estimatedTime: '08:00 AM', lat: null, lng: null });
    }

    const removeStop = (index) => {
        const updatedStops = formData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
        setFormData({ ...formData, stops: updatedStops });
    }

    const handleDelete = (id) => {
        if (window.confirm('Delete this logical route matrix? This action is irreversible.')) {
            dispatch(deleteRouteSlice(id));
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2 font-outfit">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-blue-500">Route Architecture</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Mapping logical transit paths across the sector.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
                    className="px-6 py-4 bg-blue-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group h-[42px] leading-none"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> generate matrix
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 font-outfit">
                {routes.length > 0 ? routes.map((route, i) => (
                    <div key={route._id} className={`bg-neutral-900 border ${route.status === 'inactive' ? 'border-rose-900/40 opacity-70' : 'border-slate-800/60'} rounded-md p-8 shadow-2xl group hover:border-blue-600/30 transition-all relative`}>
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-800/40">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 bg-neutral-950 border border-slate-800 rounded-md ${route.status === 'inactive' ? 'text-rose-500' : 'text-blue-500'}`}><Navigation size={20} /></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-slate-200 uppercase italic tracking-tighter leading-none">{route.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic tracking-widest ${route.status === 'active' ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'bg-rose-600/10 text-rose-500 border border-rose-600/20'}`}>
                                            {route.status || 'active'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase italic opacity-60 tracking-widest mt-1.5">
                                        Assigned Unit: {route.vehicleId?.registrationNumber || 'UNASSIGNED'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                     onClick={() => openAssign(route)}
                                     title="Manage Student Manifest"
                                     className="p-2.5 text-blue-400 hover:text-blue-300 bg-blue-600/10 border border-blue-600/20 rounded-md transition-all shadow-lg flex items-center gap-2 text-[10px] font-black uppercase italic leading-none px-4"
                                 >
                                     <Users size={16} /> manifest
                                 </button>
                                 <button 
                                     onClick={() => toggleStatus(route)}
                                     title={route.status === 'active' ? 'Deactivate Matrix' : 'Activate Matrix'}
                                     className={`p-2.5 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg ${route.status === 'active' ? 'text-emerald-500 hover:text-rose-500' : 'text-rose-500 hover:text-emerald-500'}`}
                                 >
                                     <Activity size={16} />
                                 </button>
                                <button 
                                    onClick={() => openEdit(route)}
                                    className="p-2.5 text-slate-600 hover:text-blue-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(route._id)}
                                    className="p-2.5 text-slate-600 hover:text-red-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-4 px-4 py-3 bg-neutral-950/40 rounded-md border border-slate-800/60">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Users size={14} />
                                <span className="text-xs font-black uppercase italic tracking-tighter">{route.assignedStudents?.length || 0} Entities</span>
                            </div>
                            <div className="text-[10px] text-slate-600 uppercase font-black italic tracking-widest">
                                Capacity: {route.vehicleId?.capacity || 0}
                            </div>
                            <div className="text-[10px] text-slate-600 uppercase font-black italic tracking-widest">
                                Load: {Math.round(((route.assignedStudents?.length || 0) / (route.vehicleId?.capacity || 1)) * 100)}%
                            </div>
                        </div>

                        {/* Mini Map Preview */}
                        {route.stops?.some(s => s.lat) && (
                            <div className="h-32 mb-6 rounded border border-slate-800 overflow-hidden grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                                <MapContainer 
                                    center={[route.stops.find(s => s.lat).lat, route.stops.find(s => s.lat).lng]} 
                                    zoom={11} 
                                    className="h-full w-full"
                                    zoomControl={false}
                                    dragging={false}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    {route.stops.map((s, idx) => s.lat && (
                                        <Marker 
                                            key={idx} 
                                            position={[s.lat, s.lng]} 
                                            icon={L.divIcon({ html: '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>', className: 'm-0', iconSize: [8, 8] })}
                                        />
                                    ))}
                                </MapContainer>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mb-4">Logic Nodes (Stops)</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {[...route.stops].sort((a,b) => a.order - b.order).map((stop, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group/stop">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`w-2.5 h-2.5 rounded-full ${route.status === 'inactive' ? 'bg-rose-900/60' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'}`}></div>
                                            {idx !== route.stops.length - 1 && <div className="w-px h-10 bg-slate-800/80 my-1"></div>}
                                        </div>
                                        <div className="flex-1 bg-neutral-950/40 p-3 rounded-md border border-slate-800/60 group-hover/stop:border-blue-600/20 transition-all flex justify-between items-center">
                                            <div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase italic leading-none mb-1">{stop.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase italic opacity-60 leading-none">ORDER_POINT-0{stop.order}</p>
                                                    {stop.lat && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={8} /> GEO-SYNCED</span>}
                                                </div>
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
                    <div className="xl:col-span-2 p-20 border border-slate-800 border-dashed rounded-md text-center bg-neutral-900/40 shadow-2xl">
                         <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-40">No route matrices detected in sector memory.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {(isAddOpen || isEditOpen) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0 font-outfit">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden custom-scrollbar max-h-[95vh] flex flex-col xl:flex-row">
                            
                            {/* Left: Form */}
                            <form onSubmit={isEditOpen ? handleEdit : handleAdd} className="flex-1 space-y-6 p-10 overflow-y-auto">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">
                                    {isEditOpen ? 'Edit Route Matrix' : 'Generate Route Matrix'}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                         <div className="space-y-2 col-span-1">
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Matrix Name</label>
                                             <input 
                                                 type="text" 
                                                 required
                                                 value={formData.name}
                                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                 className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all italic leading-none h-[42px]"
                                             />
                                         </div>
                                         <div className="space-y-2 col-span-1">
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 text-emerald-500/80">Vector Fee (Rs)</label>
                                             <input 
                                                 type="number" 
                                                 required
                                                 value={formData.fee}
                                                 onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value)})}
                                                 className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-emerald-500 focus:outline-none focus:border-emerald-600/50 transition-all italic leading-none h-[42px]"
                                             />
                                         </div>
                                         <div className="space-y-2 col-span-1">
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Operational Status</label>
                                             <select 
                                                 value={formData.status}
                                                 onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                 className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none h-[42px] leading-none"
                                             >
                                                 <option value="active">Active Sequence</option>
                                                 <option value="inactive">Inactive Matrix</option>
                                             </select>
                                         </div>
                                     </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Assigned Fleet Unit</label>
                                        <select 
                                            required
                                            value={formData.vehicleId}
                                            onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-blue-600/50 appearance-none h-[42px] leading-none"
                                        >
                                            <option value="">Sync Unit...</option>
                                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} ({v.driverId?.name || 'NO DRIVER'})</option>)}
                                        </select>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800/40">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-6">Logic Node Mapping</h4>
                                        <div className="space-y-4 mb-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Node Name"
                                                    value={newStop.name}
                                                    onChange={(e) => setNewStop({...newStop, name: e.target.value})}
                                                    className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 px-3 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40 h-[38px] leading-none"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="HH:MM AM/PM"
                                                    value={newStop.estimatedTime}
                                                    onChange={(e) => setNewStop({...newStop, estimatedTime: e.target.value})}
                                                    className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 px-3 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40 h-[38px] leading-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 bg-black/40 p-3 rounded-md border border-slate-800/40 flex-wrap">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 italic">
                                                    <Crosshair size={12} className={newStop.lat ? 'text-emerald-500' : ''} /> 
                                                    {newStop.lat ? `COORD: ${newStop.lat.toFixed(4)}, ${newStop.lng.toFixed(4)}` : 'PICK LOCATION ON RADAR'}
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={addStop}
                                                    disabled={!newStop.lat}
                                                    className="ml-auto bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-md text-[9px] font-black uppercase tracking-widest px-6 py-2 hover:bg-blue-600 hover:text-white transition-all italic leading-none h-[38px] disabled:opacity-30"
                                                >
                                                    register node
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {formData.stops.map((s, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-neutral-950/60 rounded-md border border-slate-800/40 group/item transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase italic w-4">{idx + 1}.</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-200 uppercase italic">{s.name}</span>
                                                            <span className="text-[9px] font-bold text-blue-500 italic">{s.estimatedTime}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-slate-600 italic uppercase">[{s.lat?.toFixed(2)}, {s.lng?.toFixed(2)}]</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeStop(idx)}
                                                            className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all bg-neutral-950 border border-slate-800 rounded-md"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} 
                                        className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none h-[42px]"
                                    >
                                        abort
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-blue-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 leading-none h-[42px] disabled:opacity-50">
                                        {loading ? 'Synthesizing...' : (isEditOpen ? 'update' : 'commit')}
                                    </button>
                                </div>
                            </form>

                            {/* Right: Radar for Picking */}
                            <div className="w-full xl:w-[450px] bg-neutral-950 border-l border-slate-800 flex flex-col">
                                <div className="p-6 border-b border-slate-800/60">
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Targeting Radar</h4>
                                     <p className="text-[8px] font-bold text-slate-600 uppercase italic mt-1.5">Click map to assign coordinate nodes</p>
                                </div>
                                <div className="flex-1 min-h-[400px]">
                                    <MapContainer 
                                        center={[23.0225, 72.5714]} 
                                        zoom={13} 
                                        className="h-full w-full"
                                        zoomControl={false}
                                    >
                                        <StopPickerMap 
                                            stops={formData.stops} 
                                            onPick={(latlng) => setNewStop({ ...newStop, lat: latlng.lat, lng: latlng.lng })} 
                                        />
                                        {newStop.lat && (
                                            <Marker 
                                                position={[newStop.lat, newStop.lng]} 
                                                icon={L.divIcon({
                                                    html: `<div class="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-xl animate-pulse"></div>`,
                                                    className: 'target-marker',
                                                    iconSize: [24, 24],
                                                    iconAnchor: [12, 12]
                                                })}
                                            />
                                        )}
                                    </MapContainer>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isAssignOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-outfit">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-neutral-900 w-full max-w-5xl h-[85vh] rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row">
                            
                            {/* Left: Enrollment Form */}
                            <div className="w-full md:w-1/3 p-10 border-r border-slate-800/60 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-8">
                                    <UserPlus className="text-blue-500" size={24} />
                                    <h3 className="text-xl font-black italic uppercase text-white leading-none">Enroll Entity</h3>
                                </div>

                                <form onSubmit={handleAssign} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Select Applicant</label>
                                        <select 
                                            required
                                            value={assignData.studentId}
                                            onChange={(e) => setAssignData({...assignData, studentId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800 rounded-md py-3 px-4 text-[11px] font-black uppercase text-slate-300 italic focus:border-blue-500 transition-all appearance-none"
                                        >
                                            <option value="">Awaiting Ingress...</option>
                                            {applicants.map(a => (
                                                <option key={a._id} value={a._id}>{a.firstName} {a.lastName} ({a.standard?.name || 'N/A'})</option>
                                            ))}
                                        </select>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase italic px-1">Note: Only students with active transport applications are indexed here.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Extraction Pt</label>
                                            <select 
                                                value={assignData.pickupStop}
                                                onChange={(e) => setAssignData({...assignData, pickupStop: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800 rounded-md py-3 px-4 text-[10px] font-black uppercase text-slate-300 italic"
                                            >
                                                {selectedRouteForAssign?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Ingress Pt</label>
                                            <select 
                                                value={assignData.dropoffStop}
                                                onChange={(e) => setAssignData({...assignData, dropoffStop: e.target.value})}
                                                className="w-full bg-neutral-950 border border-slate-800 rounded-md py-3 px-4 text-[10px] font-black uppercase text-slate-300 italic"
                                            >
                                                {selectedRouteForAssign?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Seat Assignment</label>
                                        <input 
                                            type="number"
                                            placeholder="Unit Number"
                                            value={assignData.seatNumber}
                                            onChange={(e) => setAssignData({...assignData, seatNumber: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800 rounded-md py-3 px-4 text-xs font-bold text-slate-200"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-blue-600 text-[11px] font-black uppercase italic tracking-[.2em] text-white rounded-md shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all mt-4"
                                    >
                                        Commit to Matrix
                                    </button>
                                </form>
                            </div>

                            {/* Right: Current Manifest */}
                            <div className="flex-1 bg-black/20 overflow-y-auto custom-scrollbar">
                                 <div className="p-10">
                                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800/60">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter leading-none">{selectedRouteForAssign?.name} Manifest</h3>
                                            <p className="text-[10px] font-black italic uppercase text-slate-500 tracking-widest mt-2">{selectedRouteForAssign?.assignedStudents?.length || 0} Entities Currently Locked</p>
                                        </div>
                                        <button onClick={() => setIsAssignOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedRouteForAssign?.assignedStudents?.length > 0 ? selectedRouteForAssign.assignedStudents.map((entry, idx) => (
                                            <div key={idx} className="bg-neutral-950/40 border border-slate-800/60 rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-600/30 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                                                        <Bus size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-sm font-black text-slate-200 uppercase italic tracking-wide">{entry.studentId?.firstName} {entry.studentId?.lastName}</h4>
                                                            <ShieldCheck size={14} className="text-emerald-500" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-widest mt-1">Seat: {entry.seatNumber || 'N/A'} // {entry.studentId?.admissionNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-10 mt-4 md:mt-0 px-6 py-3 bg-neutral-900/40 rounded border border-slate-800/40">
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Vector Ingress</p>
                                                        <p className="text-[10px] font-black text-blue-500 uppercase italic">{entry.pickupStop}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Vector Egress</p>
                                                        <p className="text-[10px] font-black text-rose-500 uppercase italic">{entry.dropoffStop}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleUnassign(entry.studentId?._id)}
                                                    className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all mt-4 md:mt-0 md:ml-6"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="p-20 border border-slate-800 border-dashed rounded-md text-center opacity-40">
                                                <p className="text-[11px] font-black italic uppercase tracking-widest">No entities mapped to this logistical vector.</p>
                                            </div>
                                        )}
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

export default Routes;
