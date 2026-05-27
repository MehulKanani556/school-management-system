import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriversSlice, addDriverSlice, updateDriverSlice, deleteDriverSlice, clearTransportMessage } from '../../redux/slice/transport.slice';
import { User, Phone, CreditCard, Calendar, Plus, Edit3, Trash2, Search, CheckCircle, AlertTriangle, X, ShieldAlert, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Drivers = () => {
    const dispatch = useDispatch();
    const { drivers, loading, message, error } = useSelector((state) => state.transport);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [selectedDriver, setSelectedDriver] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [formData, setFormData] = React.useState({
        name: '',
        contact: '',
        licenseNumber: '',
        email: '',
        password: '',
        baseSalary: '',
        status: 'active',
        emergencyContact: '',
        performanceRating: 5
    });

    useEffect(() => {
        dispatch(fetchDriversSlice());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            setIsAddOpen(false);
            setIsEditOpen(false);
            resetForm();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetForm = () => {
        setFormData({
            name: '',
            contact: '',
            licenseNumber: '',
            email: '',
            password: '',
            baseSalary: '',
            status: 'active',
            emergencyContact: '',
            performanceRating: 5
        });
        setSelectedDriver(null);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditOpen) {
            dispatch(updateDriverSlice({ id: selectedDriver._id, data: formData }));
        } else {
            dispatch(addDriverSlice(formData));
        }
    }

    const openEdit = (driver) => {
        setSelectedDriver(driver);
        setFormData({
            name: driver.name,
            contact: driver.contact,
            licenseNumber: driver.licenseNumber,
            licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
            email: driver.userId?.email || '',
            baseSalary: driver.userId?.baseSalary || '',
            status: driver.status || 'active',
            emergencyContact: driver.emergencyContact || '',
            performanceRating: driver.performanceRating || 5
        });
        setIsEditOpen(true);
    }

    const handleDelete = async (id) => {
        if (await window.confirm('Delete driver profile? This action cannot be undone.')) {
            dispatch(deleteDriverSlice(id));
        }
    }

    const isExpiringSoon = (date) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diff = expiry - today;
        return diff < 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    const filteredDrivers = drivers.filter(d =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transitionEnd: { transform: "none" } }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-transporter-primary">Drivers</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Manage your drivers and helpers.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-neutral-900 border border-slate-800/60 rounded-md py-2.5 pl-9 pr-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all w-full italic"
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsAddOpen(true); }}
                        className="px-6 py-4 bg-transporter-primary text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none whitespace-nowrap"
                    >
                        <Plus size={14} /> Add Driver
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDrivers.map((driver) => (
                    <div key={driver._id} className="bg-neutral-900 border border-slate-800/60 rounded-md p-6 shadow-2xl relative group hover:border-violet-600/30 transition-all flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-transporter-primary shadow-inner group-hover:border-violet-600/40 transition-all">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tighter leading-none mb-1.5">{driver.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{driver.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={() => openEdit(driver)} className="p-2 text-slate-600 hover:text-violet-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-violet-600/10"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDelete(driver._id)} className="p-2 text-slate-600 hover:text-red-400 bg-neutral-950 border border-slate-800 rounded-md transition-all shadow-lg hover:shadow-red-600/10"><Trash2 size={14} /></button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-800/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">License Number</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] font-black text-slate-300 uppercase italic leading-none">{driver.licenseNumber}</span>
                                        {isExpiringSoon(driver.licenseExpiry) && (
                                            <span className="text-[8px] font-black text-rose-500 uppercase italic mt-1 flex items-center gap-1 animate-pulse"><ShieldAlert size={8} /> Expiry Alert</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">Phone</span>
                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-violet-400 italic">
                                        <Phone size={10} />
                                        <span>{driver.contact}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">Emergency Contact</span>
                                    <span className="text-[11px] font-black text-slate-300 uppercase italic">{driver.emergencyContact || 'UNSET'}</span>
                                </div>
                            </div>
                        </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-800/40 pt-4">
                                <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.1em]">Monthly Yield</span>
                                <span className="text-[11px] font-black text-emerald-400 uppercase italic leading-none">₹{driver.userId?.baseSalary?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between bg-neutral-950/40 p-3 rounded border border-slate-800/60">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={i < (driver.performanceRating || 0) ? 'fill-orange-500 text-orange-500' : 'text-slate-800'} />
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">Service Score</span>
                            </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {(isAddOpen || isEditOpen) && (
                    <div className="fixed inset-0 -top-8 z-50 flex items-center justify-center p-6 sm:p-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-2xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">
                                    {isEditOpen ? 'Edit Staff Profile' : 'Add New Driver/Helper'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">License Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">License Expiry Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.licenseExpiry}
                                            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Account Email</label>
                                        <input
                                            type="email"
                                            required={!isEditOpen}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                            placeholder="driver@school.com"
                                        />
                                    </div>
                                    {!isEditOpen && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Initial Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Base Salary (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.baseSalary}
                                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Emergency Contact No.</label>
                                        <input
                                            type="text"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Performance Rating</label>
                                        <select
                                            value={formData.performanceRating}
                                            onChange={(e) => setFormData({ ...formData, performanceRating: parseInt(e.target.value) })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-violet-600/50 transition-all italic leading-none appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} STAR RATING</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Duty Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-violet-600/50 transition-all leading-none appearance-none"
                                        >
                                            <option value="active">ACTIVE</option>
                                            <option value="inactive">INACTIVE</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md leading-none">Cancel</button>
                                    <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-transporter-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/20 leading-none hover:translate-y-[-2px]">
                                        {loading ? 'Saving...' : isEditOpen ? 'Update Staff Member' : 'Add Staff Member'}
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

export default Drivers;
