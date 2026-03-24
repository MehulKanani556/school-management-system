import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Lock, Edit3, X, Save, Camera, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateUser } from '../../redux/slice/auth.slice';
import axiosInstance from '../../utils/axiosInstance';


const AccountantProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [photo, setPhoto] = useState(null);
    const [passwordModal, setPasswordModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('email', formData.email);
            if (photo) {
                data.append('photo', photo);
            }

            const response = await axiosInstance.put('/accountant/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch(updateUser(response.data.user));
            toast.success("Profile Synchronized: Matrix credentials updated.");
            setEditMode(false);
            setPhoto(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Credentials Mismatch: Cipher verification failed.");
        }
        setLoading(true);
        try {
            await axiosInstance.post('/accountant/change-password', {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            toast.success("Security Uplink: Encryption sequence updated.");
            setPasswordModal(false);
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Security update failed");
        } finally {
            setLoading(false);
        }
    };


    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-5xl mx-auto"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Fiscal Identity</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Auditor credentials & security protocols.</p>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setPasswordModal(true)}
                        className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/50 flex items-center gap-3"
                    >
                        Security Protocol <Lock size={14} />
                    </button>
                    {!editMode ? (
                        <button 
                                onClick={() => setEditMode(true)}
                                className="px-8 py-4 bg-accountant-primary hover:bg-amber-500 text-black rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center gap-3"
                            >
                                Modify Record <Edit3 size={14} />
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setEditMode(false)}
                                className="px-6 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={loading}
                        className="px-8 py-4 bg-accountant-primary text-black rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Synchronize
                    </button>

                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-800/60 p-10 rounded-md relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accountant-primary/5 rounded-md blur-3xl -mr-10 -mt-10"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="w-32 h-32 mx-auto rounded-md bg-slate-800 p-1 relative mb-8 group/photo">
                                <div className="w-full h-full overflow-hidden rounded-md border border-slate-700/50 flex items-center justify-center bg-slate-900 group-hover/photo:opacity-40 transition-opacity">
                                    {photo ? (
                                        <img src={URL.createObjectURL(photo)} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : user?.photo ? (
                                        <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-700" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                                <div className="absolute -bottom-2 -right-2 bg-accountant-primary p-2 rounded-md shadow-lg border-2 border-slate-900">
                                    <Shield size={16} className="text-white" />
                                </div>
                            </div>

                            
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-outfit mb-1">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-accountant-primary text-[10px] font-black uppercase tracking-[0.4em] font-outfit italic mb-6">Institutional Auditor</p>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 bg-slate-950/60 px-5 py-3 rounded-md border border-slate-800/60 shadow-inner">
                                    <Mail size={14} className="text-slate-600" />
                                    <span className="text-[11px] font-bold text-slate-400 truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-950/60 px-5 py-3 rounded-md border border-slate-800/60 shadow-inner">
                                    <Shield size={14} className="text-slate-600" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{user?.role} Node</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-slate-800/60 p-10 rounded-md shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-accountant-primary mb-12 italic border-b border-slate-800/60 pb-6">Matrix Node Information</h3>
                        
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1">Given Name</label>
                                <input 
                                    name="firstName"
                                    disabled={!editMode}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-950/60 border ${editMode ? 'border-accountant-primary/50' : 'border-slate-800'} p-5 rounded-md text-sm font-black text-white uppercase outline-none transition-all`}
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1">Family Name</label>
                                <input 
                                    name="lastName"
                                    disabled={!editMode}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-950/60 border ${editMode ? 'border-accountant-primary/50' : 'border-slate-800'} p-5 rounded-md text-sm font-black text-white uppercase outline-none transition-all`}
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1">Authentication Email</label>
                                <input 
                                    name="email"
                                    disabled={!editMode}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-950/60 border ${editMode ? 'border-accountant-primary/50' : 'border-slate-800'} p-5 rounded-md text-sm font-medium text-slate-300 italic outline-none transition-all`}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-md flex items-start gap-6 border-dashed">
                        <div className="p-3 bg-amber-500/10 rounded-md text-accountant-primary">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-2 italic">Access Level: High Priority</h4>
                            <p className="text-xs text-slate-500 leading-relaxed italic">You have root access to financial records and payroll generation. Ensure your cipher sequences are updated regularly according to institutional protocols.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            <AnimatePresence>
                {passwordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-lg p-10 rounded-md shadow-3xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setPasswordModal(false)} className="text-slate-600 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="relative z-10 space-y-8 text-center">
                                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center justify-center mx-auto mb-6">
                                    <Lock size={32} className="text-rose-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Security Uplink</h2>
                                
                                <form onSubmit={handlePasswordChange} className="space-y-6 text-left">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 italic">Old Credentials</label>
                                        <input 
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passData.oldPassword}
                                            onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                                            className="w-full bg-slate-950/60 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-rose-500 shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 italic">New Cipher Sequence</label>
                                        <input 
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passData.newPassword}
                                            onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                            className="w-full bg-slate-950/60 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-accountant-primary shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 italic">Verify Cipher</label>
                                        <input 
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            value={passData.confirmPassword}
                                            onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                            className="w-full bg-slate-950/60 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-accountant-primary shadow-inner"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-rose-600 text-white rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:bg-rose-500 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        Apply Encryption Update
                                    </button>

                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AccountantProfile;
