import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGlobalHolidays, createGlobalHoliday, updateGlobalHoliday, deleteGlobalHoliday, clearStatus } from '../../redux/slice/superAdmin.slice';
import { Plane, Plus, Calendar, Edit2, Trash2, Globe, School, MoreVertical, X, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import toast from 'react-hot-toast';

const Holidays = () => {
    const dispatch = useDispatch();
    const { holidays, loading, error, success } = useSelector((state) => state.superAdmin);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ title: '', startDate: '', endDate: '', type: 'Fixed', description: '' });

    useEffect(() => {
        dispatch(fetchGlobalHolidays());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', startDate: '', endDate: '', type: 'Fixed', description: '' });
        }
    }, [success, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate || formData.startDate) // Default endDate to startDate if not provided
        };
        
        if (editing) {
            dispatch(updateGlobalHoliday({ id: editing._id, data: payload }));
        } else {
            dispatch(createGlobalHoliday(payload));
        }
    };

    const handleDelete = async (id) => {
        if (await window.confirm('IRREVERSIBLE DELETION PROTOCOL - CONTINUE?')) {
            dispatch(deleteGlobalHoliday(id));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Institutional Holidays</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">Platform-wide temporal suspension registry.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowForm(true)}
                        className="h-14 px-8 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-4 shadow-xl shadow-superadmin-primary/20 hover:scale-105 active:scale-95 transition-all group font-outfit border border-superadmin-primary/40 uppercase tracking-widest text-[11px] font-black"
                    >
                        <Plane size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span className="italic whitespace-nowrap">Register New Global Suspension</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center opacity-30 grayscale animate-pulse">
                        <Calendar size={64} className="mb-6" />
                        <h4 className="text-xl font-black uppercase italic tracking-widest text-slate-500">Scanning Temporal Registry...</h4>
                    </div>
                ) : (
                    <AnimatePresence>
                        {Array.isArray(holidays) && holidays.length > 0 ? holidays.map((h, i) => (
                            <motion.div 
                                key={h._id} 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-900/40 border border-slate-800/60 rounded-md p-6 backdrop-blur-3xl group hover:border-superadmin-primary/30 transition-all shadow-xl shadow-black/20"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                        <Calendar size={20} className="text-slate-500 group-hover:text-superadmin-primary transition-colors duration-500" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                                        <button 
                                            onClick={() => { 
                                                setEditing(h); 
                                                setFormData({
                                                    title: h.title,
                                                    startDate: moment(h.startDate).format('YYYY-MM-DD'),
                                                    endDate: moment(h.endDate).format('YYYY-MM-DD'),
                                                    type: h.type || 'Fixed',
                                                    description: h.description
                                                }); 
                                                setShowForm(true); 
                                            }}
                                            className="p-2 rounded-md hover:bg-white/5 text-slate-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(h._id)}
                                            className="p-2 rounded-md hover:bg-superadmin-primary/10 text-slate-500 hover:text-superadmin-primary transition-all shadow-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2 truncate group-hover:text-superadmin-primary transition-colors">{h.title}</h3>
                                <div className="flex flex-col gap-1 mb-4 opacity-70">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                            {moment(h.startDate).format('MMM DD')} - {moment(h.endDate).format('MMM DD, YYYY')}
                                        </span>
                                    </div>
                                    {h.schoolId && (
                                        <div className="flex items-center gap-2 opacity-50">
                                            <School size={10} className="text-slate-500" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase italic">Linked Node</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-[9px] font-semibold text-slate-500 italic line-clamp-2 group-hover:text-slate-400 transition-colors uppercase tracking-tight leading-3">{h.description || 'No institutional telemetry provided.'}</p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30 grayscale group hover:grayscale-0 transition-all">
                                <Plane size={64} className="mb-6 opacity-20" />
                                <h4 className="text-xl font-black uppercase italic tracking-widest text-slate-500">Archive Sequence Depleted</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-xs mx-auto italic leading-relaxed text-slate-500">No institutional break nodes detected. Initiate a new temporal protocol to begin management cycle.</p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </div>


            {/* Modal Overlay Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-md w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight text-white leading-none">{editing ? 'Modify Suspension' : 'Register Suspension'}</h2>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60 px-0">Platform-wide temporal mapping protocol.</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="p-2 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-all"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2 px-1">Identity Qualifier <span className="text-superadmin-primary text-[10px]">*</span></label>
                                    <input 
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 h-12 rounded-md px-6 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-superadmin-primary transition-all italic"
                                        placeholder="HOLIDAY ENTITY NAME..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2 px-1">Temporal Entry <span className="text-superadmin-primary text-[10px]">*</span></label>
                                        <input 
                                            required
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 h-12 rounded-md px-6 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-superadmin-primary transition-all italic"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2 px-1">Temporal Exit <span className="text-superadmin-primary text-[10px]">*</span></label>
                                        <input 
                                            required
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 h-12 rounded-md px-6 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-superadmin-primary transition-all italic"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2 px-1">Institutional Infrastructure Description</label>
                                    <textarea 
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-superadmin-primary transition-all italic resize-none"
                                        placeholder="INPUT TELEMETRY DATA..."
                                    />
                                </div>
                                <button 
                                    disabled={loading}
                                    type="submit" 
                                    className="w-full h-14 bg-superadmin-primary text-black rounded-md flex items-center justify-center gap-4 shadow-xl shadow-superadmin-primary/20 hover:scale-[1.02] active:scale-95 transition-all group font-outfit uppercase tracking-widest text-[11px] font-black"
                                >
                                    <Check size={20} className="group-hover:rotate-12 transition-transform" />
                                    <span>{editing ? 'Update Registry Entity' : 'Commit New Suspension Protocol'}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Holidays;
