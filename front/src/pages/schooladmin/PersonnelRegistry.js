import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUsers, addStaff, updateStaff, deleteStaff, clearUserMessage, clearUserError } from '../../redux/slice/user.slice';
import { fetchDriversSlice, addDriverSlice, updateDriverSlice, deleteDriverSlice, clearTransportMessage } from '../../redux/slice/transport.slice';
import { 
    UserPlus, Search, Mail, Phone, ShieldCheck, MoreVertical, Trash2, Edit3, Loader2, X, Lock, 
    Truck, Users, BookOpen, Briefcase, GraduationCap, Star, ShieldAlert, CreditCard, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PersonnelRegistry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Selectors
    const { users, loading: userLoading, message: userMsg, error: userErr } = useSelector((state) => state.user);
    const { drivers, loading: driverLoading, message: driverMsg, error: driverErr } = useSelector((state) => state.transport);
    const { user: loggedInUser } = useSelector((state) => state.auth);
    
    // UI State
    const [activeTab, setActiveTab] = useState('institutional'); // 'institutional' or 'fleet'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', role: 'Accountant', password: '',
        baseSalary: '', employeeId: '',
        name: '', contact: '', licenseNumber: '', licenseExpiry: '', emergencyContact: '', performanceRating: 5
    });
    const [selectedEntity, setSelectedEntity] = useState(null);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchDriversSlice());
    }, [dispatch]);

    // Message Handling
    useEffect(() => {
        if (userMsg) {
            toast.success(userMsg);
            dispatch(clearUserMessage());
            setIsAddOpen(false);
            setIsEditOpen(false);
        }
        if (userErr) {
            toast.error(userErr);
            dispatch(clearUserError());
        }
        if (driverMsg) {
            toast.success(driverMsg);
            dispatch(clearTransportMessage());
            setIsAddOpen(false);
            setIsEditOpen(false);
        }
        if (driverErr) {
            toast.error(driverErr);
            dispatch(clearTransportMessage());
        }
    }, [userMsg, userErr, driverMsg, driverErr, dispatch]);

    const managementRoles = ['Accountant', 'Librarian', 'Transport_Manager', 'Driver'];
    
    const filteredStaff = users.filter(user => {
        const matchesRole = selectedRole === 'All' ? managementRoles.includes(user.role) : user.role === selectedRole;
        const matchesSearch = (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by school if not Super Admin
        const userSchoolId = user.schoolId?._id || user.schoolId;
        const loggedInSchoolId = loggedInUser?.schoolId?._id || loggedInUser?.schoolId;
        const matchesSchool = !loggedInUser || loggedInUser.role === 'Super_Admin' || (userSchoolId && userSchoolId.toString() === loggedInSchoolId?.toString());
            
        return matchesRole && matchesSearch && matchesSchool;
    });

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            
        // Filter by school if not Super Admin
        const driverSchoolId = d.schoolId?._id || d.schoolId;
        const loggedInSchoolId = loggedInUser?.schoolId?._id || loggedInUser?.schoolId;
        const matchesSchool = !loggedInUser || loggedInUser.role === 'Super_Admin' || (driverSchoolId && driverSchoolId.toString() === loggedInSchoolId?.toString());

        return matchesSearch && matchesSchool;
    });

    const handleProvision = (e) => {
        e.preventDefault();
        if (activeTab === 'institutional') {
            dispatch(addStaff({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                password: formData.password,
                baseSalary: formData.baseSalary,
                employeeId: formData.employeeId
            }));
        } else {
            dispatch(addDriverSlice({
                name: formData.name,
                contact: formData.contact,
                licenseNumber: formData.licenseNumber,
                licenseExpiry: formData.licenseExpiry,
                emergencyContact: formData.emergencyContact,
                performanceRating: formData.performanceRating
            }));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (activeTab === 'institutional') {
            dispatch(updateStaff({ 
                id: selectedEntity._id, 
                staffData: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    baseSalary: formData.baseSalary,
                    employeeId: formData.employeeId
                } 
            }));
        } else {
            dispatch(updateDriverSlice({ 
                id: selectedEntity._id, 
                data: {
                    name: formData.name,
                    contact: formData.contact,
                    licenseNumber: formData.licenseNumber,
                    licenseExpiry: formData.licenseExpiry,
                    emergencyContact: formData.emergencyContact,
                    performanceRating: formData.performanceRating
                } 
            }));
        }
    };

    const handleDelete = async (id) => {
        if (await window.confirm('Are you sure you want to decommission this personnel node?')) {
            if (activeTab === 'institutional') {
                dispatch(deleteStaff(id));
            } else {
                dispatch(deleteDriverSlice(id));
            }
        }
    };

    const openEdit = (entity) => {
        setSelectedEntity(entity);
        if (activeTab === 'institutional') {
            setFormData({
                firstName: entity.firstName,
                lastName: entity.lastName,
                email: entity.email,
                phone: entity.phoneNumber || '',
                role: entity.role,
                baseSalary: entity.baseSalary || '',
                employeeId: entity.employeeId || ''
            });
        } else {
            setFormData({
                name: entity.name,
                contact: entity.contact,
                licenseNumber: entity.licenseNumber,
                licenseExpiry: entity.licenseExpiry ? new Date(entity.licenseExpiry).toISOString().split('T')[0] : '',
                emergencyContact: entity.emergencyContact || '',
                performanceRating: entity.performanceRating || 5
            });
        }
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-8 font-inter pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-1 font-outfit leading-none">Personnel Hub</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-80 leading-none">Institutional Human Resource & Operations Matrix.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex p-1 bg-slate-900/60 rounded-xl border border-brand-border/40 backdrop-blur-md">
                        <button 
                            onClick={() => setActiveTab('institutional')}
                            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'institutional' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Users size={14} /> Institution Staff
                        </button>
                        <button 
                            onClick={() => setActiveTab('fleet')}
                            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'fleet' ? 'bg-schooladmin-primary text-white shadow-lg shadow-schooladmin-primary/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Truck size={14} /> Fleet Personnel
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'Accountant', password: '', baseSalary: '', employeeId: '', name: '', contact: '', licenseNumber: '', licenseExpiry: '', emergencyContact: '', performanceRating: 5 });
                            setIsAddOpen(true);
                        }}
                        className={`px-8 py-5 text-white text-[10px] font-black uppercase tracking-widest italic rounded-xl shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-3 ${activeTab === 'institutional' ? 'bg-brand-primary shadow-brand-primary/20' : 'bg-schooladmin-primary shadow-schooladmin-primary/20'}`}
                    >
                        <UserPlus size={16} /> Provision Node
                    </button>
                </div>
            </div>

            {/* Sub-Header & Filters */}
            <div className="flex flex-col md:flex-row gap-4 px-2">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                        type="text"
                        placeholder={activeTab === 'institutional' ? "SEARCH BY IDENTITY OR EMAIL..." : "SEARCH BY OPERATOR NAME OR LICENSE..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/60 border border-brand-border/40 rounded-xl py-5 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-primary transition-all italic shadow-inner"
                    />
                </div>
                {activeTab === 'institutional' && (
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-slate-900/60 border border-brand-border/40 rounded-xl py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-brand-primary transition-all italic min-w-[200px]"
                    >
                        <option value="All">All Operations</option>
                        <option value="Accountant">Fiscal Sector</option>
                        <option value="Librarian">Archive Sector</option>
                        <option value="Transport_Manager">Logistics Sector</option>
                        <option value="Driver">Operations Sector</option>
                    </select>
                )}
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                {(userLoading || driverLoading) && !users.length && !drivers.length ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-brand-primary w-12 h-12" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 animate-pulse">Synchronizing Personnel Ledger...</span>
                    </div>
                ) : activeTab === 'institutional' ? (
                    filteredStaff.map((member, i) => (
                        <PersonnelCard 
                            key={member._id} 
                            member={member} 
                            onEdit={() => openEdit(member)} 
                            onDelete={() => handleDelete(member._id)}
                            onView={() => navigate(`/school-admin/profile/${member._id}`)}
                            type="staff"
                        />
                    ))
                ) : (
                    filteredDrivers.map((driver, i) => (
                        <PersonnelCard 
                            key={driver._id} 
                            member={driver} 
                            onEdit={() => openEdit(driver)} 
                            onDelete={() => handleDelete(driver._id)}
                            type="driver"
                        />
                    ))
                )}
                {((activeTab === 'institutional' && filteredStaff.length === 0) || (activeTab === 'fleet' && filteredDrivers.length === 0)) && !userLoading && !driverLoading && (
                    <div className="col-span-full py-24 text-center bg-slate-900/40 rounded-3xl border border-brand-border/20 border-dashed">
                        <p className="text-[11px] font-black uppercase italic text-slate-600 tracking-[0.3em]">No personnel signals detected in this sector.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(isAddOpen || isEditOpen) && (
                    <div className="fixed -top-12 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => {setIsAddOpen(false); setIsEditOpen(false);}} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="bg-brand-surface w-full max-w-2xl rounded-2xl border border-brand-border shadow-2xl relative z-10 overflow-hidden">
                            <form onSubmit={isEditOpen ? handleUpdate : handleProvision} className="p-12 space-y-8">
                                <div className="flex justify-between items-center pb-6 border-b border-brand-border/40">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none font-outfit">
                                        {isEditOpen ? 'Update Personnel Logic' : 'Provision Staff Node'}
                                    </h3>
                                    <button type="button" onClick={() => {setIsAddOpen(false); setIsEditOpen(false);}} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                                </div>
                                
                                {activeTab === 'institutional' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name</label>
                                                <input
                                                    type="text" required value={formData.firstName}
                                                    placeholder="GIVEN NAME"
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name</label>
                                                <input
                                                    type="text" required value={formData.lastName}
                                                    placeholder="SURNAME"
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Official Email</label>
                                            <input
                                                type="email" required value={formData.email}
                                                placeholder="OFFICIAL@SCHOOL.COM"
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Operational Role</label>
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                                >
                                                    <option value="Accountant">Accountant</option>
                                                    <option value="Librarian">Librarian</option>
                                                    <option value="Transport_Manager">Transport Manager</option>
                                                    <option value="Driver">Driver</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Contact Link (Phone)</label>
                                                <input
                                                    type="text" value={formData.phone}
                                                    placeholder="COMM PHONE LINK"
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Base Salary (₹)</label>
                                            <input
                                                type="number" required value={formData.baseSalary}
                                                placeholder="e.g. 25000"
                                                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                                className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                            />
                                        </div>

                                        {formData.role === 'Driver' && (
                                            <div className="space-y-6 pt-6 border-t border-brand-border/20 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic ml-1">License ID</label>
                                                        <input
                                                            type="text" required value={formData.licenseNumber}
                                                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                            className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-emerald-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic ml-1">License Expiry</label>
                                                        <input
                                                            type="date" required value={formData.licenseExpiry}
                                                            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                                                            className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-emerald-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {!isEditOpen && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Initial Passkey</label>
                                                <input
                                                    type="password" placeholder="MIN 8 CHARS"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-brand-primary transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Full Operator Name</label>
                                                <input
                                                    type="text" required value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Comms Connection (Phone)</label>
                                                <input
                                                    type="text" required value={formData.contact}
                                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">License ID</label>
                                                <input
                                                    type="text" required value={formData.licenseNumber}
                                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">License Expiry</label>
                                                <input
                                                    type="date" required value={formData.licenseExpiry}
                                                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Efficiency Rating</label>
                                                <select
                                                    value={formData.performanceRating}
                                                    onChange={(e) => setFormData({ ...formData, performanceRating: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                >
                                                    {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star Efficiency</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Emergency Link</label>
                                                <input
                                                    type="text" value={formData.emergencyContact}
                                                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                                    className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-4 px-5 text-[11px] font-black uppercase italic text-white focus:outline-none focus:border-schooladmin-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-10">
                                    <button type="button" onClick={() => {setIsAddOpen(false); setIsEditOpen(false);}} className="flex-1 px-8 py-5 border border-brand-border text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-xl">Abort Protocol</button>
                                    <button type="submit" className={`flex-1 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] italic text-white rounded-xl hover:translate-y-[-2px] transition-all shadow-2xl ${activeTab === 'institutional' ? 'bg-brand-primary shadow-brand-primary/20' : 'bg-schooladmin-primary shadow-schooladmin-primary/20'}`}>
                                        {isEditOpen ? 'Apply Modifications' : 'Finalize Provision'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Reusable Personnel Card Component
const PersonnelCard = ({ member, onEdit, onDelete, onView, type }) => {
    const isStaff = type === 'staff';
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-brand-surface/60 backdrop-blur-3xl border border-brand-border/40 rounded-3xl p-8 shadow-2xl group hover:border-sky-500/30 transition-all flex flex-col sm:flex-row gap-8 relative overflow-hidden font-outfit border-l-4 ${isStaff ? 'border-l-brand-primary' : 'border-l-violet-500'}`}
        >
            <div className={`absolute top-0 right-0 w-44 h-44 ${isStaff ? 'bg-brand-primary/5' : 'bg-schooladmin-primary/5'} blur-[80px] rounded-full -mr-20 -mt-20`}></div>

            <div className="relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-neutral-950 border border-brand-border/40 flex items-center justify-center text-slate-500 overflow-hidden shadow-2xl ring-1 ring-white/5 uppercase font-black text-3xl italic group-hover:scale-105 transition-transform">
                    {member.photo ? (
                        <img src={member.photo} alt={member.firstName || member.name} className="w-full h-full object-cover" />
                    ) : (
                        (member.firstName || member.name)?.[0] || '?'
                    )}
                </div>
                {!isStaff && (
                    <div className="mt-4 flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < (member.performanceRating || 0) ? 'fill-orange-500 text-orange-500' : 'text-slate-800'} />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        {isStaff ? (
                            <h3 
                                className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 group-hover:text-sky-400 transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onView && onView();
                                }}
                            >
                                {member.firstName} {member.lastName}
                            </h3>
                        ) : (
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 hover:text-schooladmin-primary transition-colors">
                                {member.name}
                            </h3>
                        )}
                        {isStaff ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500">{member.role} NODE</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">ID: {member.employeeId || 'GENERATING...'}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500">OPERATOR: {member.licenseNumber}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {isStaff && (
                            <button onClick={onView} className="p-3 bg-slate-900 border border-brand-border/40 rounded-xl text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all shadow-xl" title="View Profile"><Eye size={16} /></button>
                        )}
                        <button onClick={onEdit} className="p-3 bg-slate-900 border border-brand-border/40 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all shadow-xl" title="Edit Entity"><Edit3 size={16} /></button>
                        <button onClick={onDelete} className="p-3 bg-slate-900 border border-brand-border/40 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-xl" title="Purge Node"><Trash2 size={16} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-brand-border/20">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Comm Link</p>
                        <div className="flex items-center gap-3">
                            <Mail size={14} className="text-brand-primary opacity-60" />
                            <span className="text-[11px] font-bold text-slate-400 truncate">{isStaff ? member.email : member.contact}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Nexus Link</p>
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-brand-primary opacity-60" />
                            <span className="text-[11px] font-bold text-slate-400">{isStaff ? (member.phoneNumber || 'LOCKED') : (member.emergencyContact || 'UNSET')}</span>
                        </div>
                    </div>
                    {isStaff && (
                        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-brand-border/10">
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Compensation Manifest</p>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-500 opacity-60" />
                                <span className="text-[12px] font-black text-white italic uppercase tracking-tighter">Base Yield: <span className="text-emerald-400">₹{member.baseSalary?.toLocaleString() || '0'}</span></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PersonnelRegistry;
