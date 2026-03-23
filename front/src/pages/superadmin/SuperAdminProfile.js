import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProfile, updateAdminProfile, clearStatus } from '../../redux/slice/superAdmin.slice';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Lock, 
    Camera, 
    ShieldCheck, 
    RefreshCw, 
    Check,
    CloudIcon,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading, success, error } = useSelector((state) => state.superAdmin);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || ''
            });
            setPreview(profile.photo);
        }
    }, [profile]);

    useEffect(() => {
        if (success) {
            toast.success(success);
            dispatch(clearStatus());
        }
        if (error) {
            toast.error(error);
            dispatch(clearStatus());
        }
    }, [success, error, dispatch]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        if (fileInputRef.current.files[0]) {
            data.append('photo', fileInputRef.current.files[0]);
        }
        dispatch(updateAdminProfile(data));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl mx-auto space-y-12 pb-20"
        >
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-8 group">
                    <div className="w-36 h-36 rounded-md border-2 border-brand-border p-1.5 transition-all group-hover:border-brand-primary/40 bg-brand-surface shadow-2xl overflow-hidden">
                        <div className="w-full h-full rounded-md bg-brand-background overflow-hidden flex items-center justify-center border border-brand-border group-hover:bg-brand-primary/5 transition-colors">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            ) : (
                                <User size={48} className="text-slate-600 group-hover:text-brand-primary transition-colors duration-500" />
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-2 right-2 p-3 bg-brand-primary text-white rounded-md shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Camera size={18} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-100 italic uppercase tracking-tighter leading-none mb-2">Master Identity</h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] font-outfit italic">Global Node Access Provisioned</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Information Card */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSubmit} className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <ShieldCheck size={120} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Identity Core Name</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-brand-primary transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input 
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full bg-brand-background border border-brand-border rounded-md px-12 py-3.5 text-sm font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/40 focus:bg-brand-primary/5 transition-all italic hover:border-brand-primary/20"
                                        placeholder="First Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Secondary Name</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-brand-primary transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input 
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full bg-brand-background border border-brand-border rounded-md px-12 py-3.5 text-sm font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/40 focus:bg-brand-primary/5 transition-all italic hover:border-brand-primary/20"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Communication Protocol (Email)</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-brand-primary transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-brand-background border border-brand-border rounded-md px-12 py-3.5 text-sm font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-brand-primary/40 focus:bg-brand-primary/5 transition-all italic hover:border-brand-primary/20"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest italic rounded-md shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Check size={20} /> Synchronize Profile Matrix</>}
                        </button>
                    </form>

                    <div className="bg-brand-surface p-10 rounded-md border border-brand-border border-dashed flex items-center justify-between group hover:bg-luxury-rose/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-md bg-luxury-rose/10 flex items-center justify-center text-luxury-rose group-hover:scale-110 transition-transform duration-500">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.2em] font-outfit mb-1">Security Credentials</h4>
                                <p className="text-[10px] font-medium text-slate-500 italic">Rotate Master Passphrase & Security Protocols.</p>
                            </div>
                        </div>
                        <div className="text-slate-700 group-hover:text-luxury-rose transition-colors"><ArrowRight size={24} /></div>
                    </div>
                </div>

                {/* Sidebar Matrix */}
                <div className="space-y-8">
                    <div className="p-8 rounded-md bg-brand-surface border border-brand-border">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Identity Metrics</h4>
                        <div className="space-y-6">
                            {[
                                { label: 'Auth Level', value: 'Level 10', color: 'text-brand-primary' },
                                { label: 'Node Access', value: 'Omnipresent', color: 'text-luxury-emerald' },
                                { label: 'System Uptime', value: '42 Days', color: 'text-brand-accent' },
                                { label: 'Integrity', value: '99.9%', color: 'text-luxury-gold' },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-end border-b border-brand-border/30 pb-3">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{stat.label}</span>
                                    <span className={`text-[11px] font-black uppercase italic ${stat.color}`}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-md bg-brand-background border border-brand-border flex flex-col items-center text-center group">
                        <CloudIcon size={32} className="text-slate-700 mb-6 group-hover:text-brand-primary transition-colors duration-500" />
                        <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-[0.1em] font-outfit mb-3 italic leading-tight">Global Instance Sync</h4>
                        <p className="text-[9px] font-medium text-slate-500 italic max-w-xs leading-relaxed">
                            Your identity is verified and broadcasted across all nodes in the infrastructure cluster.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SuperAdminProfile;
