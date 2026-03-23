import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutesSlice, assignStudentSlice } from '../../redux/slice/transport.slice';
import { fetchUsers } from '../../redux/slice/user.slice';
import { Users, Navigation, MapPin, Search, Plus, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentAssignment = () => {
    const dispatch = useDispatch();
    const { routes, loading, success } = useSelector((state) => state.transport);
    const { users: students } = useSelector((state) => state.user); // Student users
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [formData, setFormData] = React.useState({ routeId: '', studentId: '', pickupStop: '', dropoffStop: '' });

    useEffect(() => {
        dispatch(fetchRoutesSlice());
        dispatch(fetchUsers());
    }, [dispatch, success]);

    const handleAssign = (e) => {
        e.preventDefault();
        dispatch(assignStudentSlice({ routeId: formData.routeId, data: formData }));
        setIsAddOpen(false);
    }

    const assignedCount = routes.reduce((acc, r) => acc + (r.assignedStudents?.length || 0), 0);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-10">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-100 italic uppercase tracking-tighter mb-1 leading-none text-emerald-500 font-outfit uppercase">Assignment Terminal</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Linking citizen nodes to institutional mobility matrices.</p>
                </div>
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="px-6 py-4 bg-emerald-600 text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none font-outfit"
                >
                    <Plus size={14} /> assign citizen
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {routes.map((route, i) => (
                    <div key={i} className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden group hover:border-emerald-600/20 transition-all font-outfit">
                        <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Navigation size={18} className="text-emerald-500" />
                                <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter">{route.name} Matrix</h3>
                                <span className="text-[9px] font-black uppercase text-slate-500 italic bg-slate-900 px-3 py-1 rounded-md border border-slate-800/60">{route.assignedStudents?.length || 0} Citizens Linked</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {route.assignedStudents?.map((as, idx) => (
                                    <div key={idx} className="bg-neutral-950/40 border border-slate-800/60 rounded-md p-5 flex items-center gap-4 group/card hover:bg-neutral-900 transition-all">
                                        <div className="w-10 h-10 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover/card:border-emerald-600/40 transition-all">
                                            <User size={18} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-black text-slate-100 uppercase italic tracking-tighter truncate">{as.studentId?.firstName} {as.studentId?.lastName}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <MapPin size={10} className="text-emerald-500 opacity-60 flex-shrink-0" />
                                                <p className="text-[9px] font-black text-slate-500 uppercase italic truncate">{as.pickupStop} point</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!route.assignedStudents || route.assignedStudents.length === 0) && (
                                    <div className="lg:col-span-3 py-10 text-center opacity-40 italic font-black uppercase text-[10px] tracking-widest text-slate-600">No citizens linked to this matrix sector.</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {routes.length === 0 && <p className="px-6 py-20 text-center text-slate-500 italic font-black uppercase text-xs tracking-[0.2em] opacity-40">No route matrices detected. Assign citizen nodes once matrix is generated.</p>}
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-lg rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden font-outfit">
                            <form onSubmit={handleAssign} className="space-y-6 p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">Citizen Linkage Protocol</h3>
                                
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Identity Node (Citizen)</label>
                                        <select 
                                            required
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-emerald-600/50 transition-all leading-none"
                                        >
                                            <option value="">Select Citizen Hash...</option>
                                            {students.filter(s => s.role === 'Student').map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Mobility Matrix (Route)</label>
                                        <select 
                                            required
                                            value={formData.routeId}
                                            onChange={(e) => {
                                                setFormData({...formData, routeId: e.target.value, pickupStop: '', dropoffStop: ''});
                                            }}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-emerald-600/50 transition-all leading-none"
                                        >
                                            <option value="">Select Sector Matrix...</option>
                                            {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    
                                    {formData.routeId && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Pickup Logic Point</label>
                                                <select 
                                                    required
                                                    value={formData.pickupStop}
                                                    onChange={(e) => setFormData({...formData, pickupStop: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-emerald-600/50 transition-all leading-none"
                                                >
                                                    <option value="">Select Point...</option>
                                                    {routes.find(r => r._id === formData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Dropoff Logic Point</label>
                                                <select 
                                                    required
                                                    value={formData.dropoffStop}
                                                    onChange={(e) => setFormData({...formData, dropoffStop: e.target.value})}
                                                    className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-emerald-600/50 transition-all leading-none"
                                                >
                                                    <option value="">Select Point...</option>
                                                    {routes.find(r => r._id === formData.routeId)?.stops.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">abort protocol</button>
                                    <button type="submit" className="flex-1 px-6 py-4 bg-emerald-600 text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 leading-none hover:translate-y-[-2px]">confirm link</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentAssignment;
