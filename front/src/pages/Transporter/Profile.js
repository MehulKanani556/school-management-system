import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearAuthMessage, logout } from '../../redux/slice/auth.slice';
import { User, Mail, Phone, MapPin, Shield, Bell, Settings, LogOut, Camera, Save, Lock, Smartphone, Globe, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const dispatch = useDispatch();
    const { user, loading, message, error } = useSelector((state) => state.auth);

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        photo: null,
        preview: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                photo: null,
                preview: user.photo || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearAuthMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearAuthMessage());
        }
    }, [message, error, dispatch]);

    const [notifications, setNotifications] = useState({
        tripStart: true,
        tripEnd: false,
        emergency: true,
        maintenance: true,
        parentMessages: true
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData({
                ...profileData,
                photo: file,
                preview: URL.createObjectURL(file)
            });
        }
    }

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('firstName', profileData.firstName);
        formData.append('lastName', profileData.lastName);
        formData.append('email', profileData.email);
        if (profileData.photo) {
            formData.append('photo', profileData.photo);
        }
        dispatch(updateProfile(formData));
    };

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    if (!user) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-transporter-primary">My Profile</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Check your details and change settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-transporter-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-transporter-primary/20 transition-all duration-700"></div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-6">
                                <div className="w-28 h-28 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-transporter-primary group-hover:border-transporter-primary/40 transition-all duration-500 overflow-hidden">
                                    {profileData.preview ? (
                                        <img src={profileData.preview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-2 bg-transporter-primary text-white rounded-md shadow-lg shadow-transporter-primary/20 hover:bg-transporter-primary transition-all cursor-pointer">
                                    <Camera size={14} />
                                    <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                                </label>
                            </div>

                            <h2 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter leading-none mb-2">{user.firstName} {user.lastName}</h2>
                            <p className="text-[10px] font-black text-transporter-primary uppercase tracking-[0.2em] italic mb-6"> {user.role?.replace('_', ' ')} </p>

                            <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-slate-800/40">
                                <div className="bg-neutral-950/60 p-3 rounded-md border border-slate-800/40">
                                    <p className="text-[9px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">ID</p>
                                    <p className="text-[11px] font-black text-slate-300 uppercase italic leading-none truncate">{user._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="bg-neutral-950/60 p-3 rounded-md border border-slate-800/40">
                                    <p className="text-[9px] font-black text-slate-600 uppercase italic mb-1 tracking-widest">Type</p>
                                    <p className="text-[11px] font-black text-slate-300 uppercase italic leading-none">Admin</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 space-y-4 relative z-10">
                            <div className="flex items-center gap-4 text-slate-400 group/item">
                                <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-700 group-hover/item:text-transporter-primary transition-all"><Mail size={14} /></div>
                                <span className="text-[11px] font-black italic tracking-tighter uppercase truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 group/item">
                                <div className="w-8 h-8 rounded-md bg-neutral-950 border border-slate-800 flex items-center justify-center text-slate-700 group-hover/item:text-transporter-primary transition-all"><Shield size={14} /></div>
                                <span className="text-[11px] font-black italic tracking-tighter uppercase">{user.role}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 border border-transporter-primary/30 text-transporter-primary bg-transporter-primary/5 rounded-md text-[10px] font-black uppercase tracking-widest italic hover:bg-transporter-primary hover:text-white transition-all shadow-xl shadow-transporter-primary/10 flex items-center justify-center gap-3 h-[42px]"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>

                {/* Settings Panels */}
                <form onSubmit={handleSave} className="lg:col-span-2 space-y-8 font-outfit">
                    {/* General Settings */}
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950/40 flex items-center gap-3">
                            <Settings size={18} className="text-transporter-primary" />
                            <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter">My Details</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">First Name</label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-transporter-primary/50 transition-all italic leading-none uppercase h-[42px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Last Name</label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-transporter-primary/50 transition-all italic leading-none uppercase h-[42px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 leading-none">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-transporter-primary/50 transition-all italic leading-none uppercase h-[42px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-transporter-primary italic opacity-80 flex items-center gap-2 mb-4">
                                    <Bell size={10} /> Notification Settings
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-neutral-950/60 border border-slate-800/40 rounded-md">
                                            <span className="text-[10px] font-black uppercase text-slate-400 italic tracking-tighter">
                                                {key.replace(/([A-Z])/g, ' $1').trim()} Notifications
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setNotifications({ ...notifications, [key]: !value })}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${value ? 'bg-transporter-primary' : 'bg-slate-800'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${value ? 'left-6' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-transporter-primary text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-transporter-primary/20 hover:shadow-transporter-primary/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group leading-none disabled:opacity-50 h-[42px]"
                                >
                                    <Save size={14} /> {loading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security & Access */}
                    <div className="bg-neutral-900 border border-slate-800/60 rounded-md shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-800/60 bg-neutral-950/40 flex items-center gap-3">
                            <Shield size={18} className="text-emerald-500" />
                            <h3 className="text-md font-black text-slate-100 uppercase italic tracking-tighter">Security</h3>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-5 bg-neutral-950/60 border border-slate-800/40 rounded-md group hover:border-emerald-600/20 transition-all">
                                    <div className="flex items-center gap-4 text-emerald-500/80">
                                        <Lock size={20} />
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic tracking-tighter text-slate-200">Change Password</p>
                                            <p className="text-[9px] font-bold uppercase italic text-slate-600 opacity-60">Update security credentials</p>
                                        </div>
                                    </div>
                                    <button type="button" className="px-4 py-2 border border-slate-800 text-[9px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800/30 transition-all rounded-md h-[42px]">Reset</button>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-neutral-950/60 border border-slate-800/40 rounded-md group hover:border-emerald-600/20 transition-all opacity-80">
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <Layers size={20} />
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic tracking-tighter text-slate-200">Two-Factor Authentication</p>
                                            <p className="text-[9px] font-bold uppercase italic text-slate-600 opacity-60">Not available yet</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 bg-slate-800/60 text-slate-500 border border-slate-700 rounded-md text-[9px] font-black italic tracking-widest h-[42px] flex items-center">OFF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Profile;
