import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, addStaff, updateStaff, deleteStaff, clearUserMessage, clearUserError } from '../../redux/slice/user.slice';
import { UserPlus, Search, Mail, Phone, ShieldCheck, MoreVertical, Trash2, Edit3, Loader2, X, Lock } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';


const StaffRegistry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, message, error } = useSelector((state) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Accountant', password: '', baseSalary: '', employeeId: '' });
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Accountant', baseSalary: '', employeeId: '' });

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            setTimeout(() => dispatch(clearUserMessage()), 3000);
            setIsAddOpen(false);
            setIsEditOpen(false);
        }
        if (error) {
            setTimeout(() => dispatch(clearUserError()), 3000);
        }
    }, [message, error, dispatch]);

    const staffRoles = ['Accountant', 'Librarian', 'Transport_Manager'];
    const filteredStaff = users.filter(user => {
        const matchesRole = selectedRole === 'All' ? staffRoles.includes(user.role) : user.role === selectedRole;
        const matchesSearch = (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addStaff(formData));
        setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'Accountant', password: '', baseSalary: '', employeeId: '' });
    };

    const handleEditClick = (member) => {
        setSelectedStaff(member);
        setEditFormData({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            phone: member.phoneNumber || '',
            role: member.role,
            baseSalary: member.baseSalary || '',
            employeeId: member.employeeId || ''
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        dispatch(updateStaff({ id: selectedStaff._id, staffData: editFormData }));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to decommission this personnel node?')) {
            dispatch(deleteStaff(id));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-inter">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-1 font-outfit leading-none">Staff Registry</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-80 leading-none">Synchronizing institutional human assets.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-6 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest italic rounded-md shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 mr-2"
                    >
                        <UserPlus size={14} /> provision personnel
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH NODE ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/60 border border-brand-border/40 rounded-md py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-primary transition-all w-full md:w-64 italic"
                        />
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-slate-900/60 border border-brand-border/40 rounded-md py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-brand-primary transition-all italic"
                    >
                        <option value="All">All Operations</option>
                        <option value="Accountant">Fiscal</option>
                        <option value="Librarian">Archive</option>
                        <option value="Transport_Manager">Logistics</option>
                    </select>
                </div>
            </div>

            {message && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest italic rounded-md shadow-xl text-center">{typeof message === 'object' ? message.message : message}</div>}
            {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest italic rounded-md shadow-xl text-center">{typeof error === 'object' ? error.message : error}</div>}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                {loading && !users.length ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-brand-primary w-10 h-10" /></div>
                ) : filteredStaff.length > 0 ? filteredStaff.map((member, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={member._id}
                        className="bg-brand-surface/60 backdrop-blur-xl border border-brand-border/40 rounded-md p-8 shadow-2xl group hover:border-brand-primary/40 transition-all flex flex-col sm:flex-row gap-8 relative overflow-hidden font-outfit"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[60px] rounded-full -mr-10 -mt-10"></div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-md bg-slate-900 border border-brand-border/40 flex items-center justify-center text-slate-500 overflow-hidden shadow-2xl ring-1 ring-white/5 uppercase font-black text-2xl italic">
                                {member.photo ? (
                                    <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    member.firstName?.[0] || '?'
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-5 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div 
                                        className="cursor-pointer group/name flex items-center gap-3"
                                        onClick={() => navigate(`/school-admin/profile/${member._id}`)}
                                    >
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-1 group-hover/name:text-brand-primary transition-colors">{member.firstName} {member.lastName}</h3>
                                        <span className="text-[10px] text-slate-500 font-mono tracking-tighter shadow-sm bg-slate-800/50 px-2 py-1 rounded border border-white/5 lowercase italic font-bold">id: {member.employeeId || 'auto-gen'}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic px-3 py-1 rounded-md border ${member.role === 'Accountant' ? 'border-luxury-gold/20 text-luxury-gold bg-luxury-gold/5' :
                                            member.role === 'Librarian' ? 'border-indigo-600/20 text-indigo-400 bg-indigo-600/5' :
                                                'border-orange-600/20 text-orange-400 bg-orange-600/5'
                                        }`}>
                                        {member.role.replace('_', ' ')} logic
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(member)}
                                        className="p-2.5 bg-slate-950 border border-brand-border/40 rounded-md text-slate-600 hover:text-white transition-all"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2.5 bg-slate-950 border border-brand-border/40 rounded-md text-slate-600 hover:text-luxury-rose transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-border/20">
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-brand-primary opacity-60" />
                                    <span className="text-[11px] font-bold text-slate-400 truncate">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-brand-primary opacity-60" />
                                    <span className="text-[11px] font-bold text-slate-400">{member.phoneNumber || 'Node Locked'}</span>
                                </div>
                                <div className="flex items-center gap-3 col-span-2">
                                    <ShieldCheck size={14} className="text-emerald-500 opacity-60" />
                                    <span className="text-[11px] font-black text-white uppercase italic tracking-widest">Base Yield: <span className="text-emerald-400">₹{member.baseSalary?.toLocaleString() || '0'}</span></span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-md border border-brand-border/20 border-dashed">
                        <p className="text-[11px] font-black uppercase italic text-slate-600 tracking-[0.3em]">No personnel detected in the selected logical sector.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-brand-surface w-full max-w-xl rounded-md border border-brand-border shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleAdd} className="space-y-6 p-12">
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-brand-border/40">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none font-outfit">Provision Staff Node</h3>
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">First Name</label>
                                        <input
                                            type="text" required placeholder="GIVEN NAME"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Last Name</label>
                                        <input
                                            type="text" required placeholder="SURNAME"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Institutional Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input
                                            type="email" required placeholder="CITIZEN@PLATFORM.EDU"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 pl-12 pr-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Operational Role</label>
                                        <select
                                            required value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                                        >
                                            <option value="Accountant">Accountant (Fiscal)</option>
                                            <option value="Librarian">Librarian (Archive)</option>
                                            <option value="Transport_Manager">Transport Manager (Logistics)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Phone Contact</label>
                                        <input
                                            type="text" placeholder="COMM LINK ID"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Base Salary (₹)</label>
                                        <input
                                            type="number" required placeholder="e.g. 25000"
                                            value={formData.baseSalary}
                                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Initial Passkey</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="password" placeholder="MIN 6 CHAR"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 pl-12 pr-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-8 py-5 border border-brand-border text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none">abort protocol</button>
                                    <button disabled={loading} type="submit" className="flex-1 px-8 py-5 bg-brand-primary text-[10px] font-black uppercase tracking-[0.2em] italic text-white rounded-md hover:bg-schooladmin-primary transition-all shadow-2xl shadow-schooladmin-primary/20 leading-none flex items-center justify-center gap-2">
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'confirm provision'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isEditOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditOpen(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-brand-surface w-full max-w-xl rounded-md border border-brand-border shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={handleUpdate} className="space-y-6 p-12">
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-brand-border/40">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none font-outfit">Modify Personnel Node</h3>
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">First Name</label>
                                        <input
                                            type="text" required placeholder="GIVEN NAME"
                                            value={editFormData.firstName}
                                            onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Last Name</label>
                                        <input
                                            type="text" required placeholder="SURNAME"
                                            value={editFormData.lastName}
                                            onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Institutional Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input
                                            type="email" required placeholder="CITIZEN@PLATFORM.EDU"
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 pl-12 pr-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Operational Role</label>
                                        <select
                                            required value={editFormData.role}
                                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                                        >
                                            <option value="Accountant">Accountant (Fiscal)</option>
                                            <option value="Librarian">Librarian (Archive)</option>
                                            <option value="Transport_Manager">Transport Manager (Logistics)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Phone Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="text" placeholder="COMM LINK ID"
                                                value={editFormData.phone}
                                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 pl-12 pr-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Base Salary (₹)</label>
                                    <input
                                        type="number" required placeholder="e.g. 25000"
                                        value={editFormData.baseSalary}
                                        onChange={(e) => setEditFormData({ ...editFormData, baseSalary: e.target.value })}
                                        className="w-full bg-slate-950 border border-brand-border/40 rounded-md py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all leading-none shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-4 pt-10">
                                    <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-8 py-5 border border-brand-border text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none">abort protocol</button>
                                    <button disabled={loading} type="submit" className="flex-1 px-8 py-5 bg-brand-primary text-[10px] font-black uppercase tracking-[0.2em] italic text-white rounded-md hover:bg-schooladmin-primary transition-all shadow-2xl shadow-schooladmin-primary/20 leading-none flex items-center justify-center gap-2">
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply modifications'}
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

export default StaffRegistry;
