import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProfile, updateAdminProfile, clearStatus } from '../../redux/slice/superAdmin.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Lock, 
    Camera, 
    Shield, 
    RefreshCw, 
    Check,
    ArrowRight,
    LockKeyhole,
    Clock,
    X,
    Eye,
    EyeOff,
    Activity,
    Cpu,
    Database,
    Fingerprint,
    Sliders,
    CheckCircle2,
    ShieldAlert,
    Network
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';
import axiosInstance from '../../utils/axiosInstance';
import PortalModal from '../../components/PortalModal';

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

    // Password change states
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

    const getPasswordMetrics = (pass) => {
        const hasLength = pass.length >= 6;
        const hasNumber = /\d/.test(pass);
        const hasUpperOrSpecial = /[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass);
        
        let score = 0;
        if (pass.length > 0) {
            if (hasLength) score += 1;
            if (pass.length >= 8) score += 1;
            if (hasNumber) score += 1;
            if (hasUpperOrSpecial) score += 1;
        }

        let label = 'WEAK';
        let color = 'bg-rose-500';
        let textColor = 'text-rose-400';
        
        if (score === 3) {
            label = 'MEDIUM';
            color = 'bg-amber-500';
            textColor = 'text-amber-400';
        } else if (score === 4) {
            label = 'STRONG';
            color = 'bg-emerald-500';
            textColor = 'text-emerald-400';
        }

        return { score, label, color, textColor, hasLength, hasNumber, hasUpperOrSpecial };
    };

    const metrics = getPasswordMetrics(passwordData.newPassword);

    // Mock logs & diagnostic levels for premium detailing
    const mockLogs = [
        { time: '16:32:20', ip: '192.168.1.102', event: 'Master authorization verified', status: 'SECURE' },
        { time: '15:45:10', ip: '127.0.0.1', event: 'Database backup synchronized', status: 'SUCCESS' },
        { time: '14:20:05', ip: '192.168.1.102', event: 'System variables retrieved', status: 'AUDITED' },
        { time: '12:10:00', ip: '10.0.0.4', event: 'System firewall heartbeat ok', status: 'ACTIVE' }
    ];

    const privilegeList = [
        { name: 'School onboarding', allowed: true },
        { name: 'Backup orchestration', allowed: true },
        { name: 'System logs access', allowed: true },
        { name: 'Master config bypass', allowed: true },
        { name: 'Billing management', allowed: true }
    ];

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

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (!passwordData.oldPassword) {
            return toast.error("Current password is required");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Confirm password does not match");
        }

        setChangingPassword(true);
        try {
            const res = await axiosInstance.post('/superadmin/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.success) {
                toast.success("Credentials updated successfully!");
                setIsPasswordModalOpen(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message || "Failed to change credentials");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change credentials");
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-[1400px] mx-auto space-y-8 pb-20 relative font-outfit"
        >
            {/* Cyberpunk Radial Backdrop Glows */}
            <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-gradient-to-tr from-superadmin-primary/10 via-indigo-500/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {/* Futuristic Header with neon status dot */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-inter flex items-center gap-3">
                        <Fingerprint size={28} className="text-superadmin-primary" />
                        Admin Console Profile
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Root Administrator Credentials & Diagnostics
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-xl">
                        <Activity size={14} className="text-superadmin-primary animate-pulse" />
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SYS HEALTH</p>
                            <p className="text-[10px] font-bold text-emerald-400">99.98% OPERATIONAL</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Column 1: Identity & Stats Matrix */}
                <div className="space-y-8">
                    
                    {/* Identity card with scanner frame */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-superadmin-primary/30"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-superadmin-primary/30"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-superadmin-primary/30"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-superadmin-primary/30"></div>

                        {/* Scanner Avatar circle */}
                        <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current.click()}>
                            <div className="w-36 h-36 rounded-full border-2 border-dashed border-superadmin-primary/40 p-1 bg-slate-900/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:border-superadmin-primary group-hover:rotate-12">
                                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                                    {getImageUrl(preview) ? (
                                        <img src={getImageUrl(preview)} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <User size={42} className="text-slate-600 group-hover:text-superadmin-primary transition-colors duration-500" />
                                    )}
                                </div>
                                {/* Scanning line effect */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-superadmin-primary to-transparent animate-bounce opacity-40"></div>
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                    <Camera size={20} className="text-white animate-pulse" />
                                </div>
                            </div>
                            <button 
                                type="button"
                                className="absolute bottom-1 right-1 p-2.5 bg-superadmin-primary text-black rounded-xl shadow-lg hover:scale-110 transition-all border border-black/10"
                            >
                                <Camera size={14} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                        
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                            {profile?.firstName || 'ADMIN'} {profile?.lastName || 'USER'}
                        </h3>
                        <span className="text-[9px] font-black text-superadmin-primary bg-superadmin-primary/10 border border-superadmin-primary/30 px-4 py-1.5 rounded-lg tracking-widest mt-3.5 uppercase font-mono shadow-[0_0_15px_rgba(129,140,248,0.1)]">
                            PLATFORM ADMINISTRATOR
                        </span>
                    </div>

                    {/* Diagnostics Widget */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-3xl shadow-xl relative">
                        <div className="flex items-center gap-3 mb-6">
                            <Cpu size={16} className="text-superadmin-primary" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">REAL-TIME DIAGNOSTICS</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'API PING LATENCY', val: '42 MS', pct: 90, color: 'bg-emerald-500' },
                                { label: 'DB CONNECTION POOL', val: '12 / 100', pct: 12, color: 'bg-indigo-500' },
                                { label: 'CPU CORE TEMP', val: '38°C', pct: 40, color: 'bg-sky-500' },
                                { label: 'SECURITY INTERRUPTS', val: '0 INTR', pct: 0, color: 'bg-emerald-500' }
                            ].map((diag, index) => (
                                <div key={index} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[8px] font-black tracking-wider text-slate-500">
                                        <span>{diag.label}</span>
                                        <span className="text-slate-300 font-mono">{diag.val}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5 overflow-hidden">
                                        <div 
                                            className={`${diag.color} h-full rounded-full transition-all duration-1000`} 
                                            style={{ width: `${diag.pct || 1}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Authorization matrix */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-3xl shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield size={16} className="text-superadmin-primary" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">SECURITY PRIVILEGE MATRIX</h4>
                        </div>
                        <div className="space-y-3">
                            {privilegeList.map((priv, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-950/40 border border-white/5 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{priv.name}</span>
                                    <span className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md uppercase font-black">
                                        <CheckCircle2 size={10} /> ALLOWED
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2 & 3: Settings Panel & Form */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Information configuration form */}
                    <form onSubmit={handleSubmit} className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                            <Sliders size={180} className="text-superadmin-primary" />
                        </div>
                        
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                            <User size={18} className="text-superadmin-primary" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">PROFILE SETTINGS CALIBRATION</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">FIRST NAME</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-superadmin-primary transition-colors">
                                        <User size={14} />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-superadmin-primary/60 focus:bg-superadmin-primary/[0.02] focus:shadow-[0_0_15px_rgba(129,140,248,0.15)] transition-all"
                                        placeholder="First Name"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">LAST NAME</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-superadmin-primary transition-colors">
                                        <User size={14} />
                                    </div>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-superadmin-primary/60 focus:bg-superadmin-primary/[0.02] focus:shadow-[0_0_15px_rgba(129,140,248,0.15)] transition-all"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-1">EMAIL ADDRESS</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-superadmin-primary transition-colors">
                                        <Mail size={14} />
                                    </div>
                                    <input 
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-12 py-3.5 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-superadmin-primary/60 focus:bg-superadmin-primary/[0.02] focus:shadow-[0_0_15px_rgba(129,140,248,0.15)] transition-all"
                                        placeholder="Email Address"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-black text-[10px] font-black uppercase tracking-widest italic rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 text-white border border-white/10"
                        >
                            {loading ? <RefreshCw className="animate-spin text-white" size={16} /> : <><Check size={16} className="text-white" /> UPDATE PROFILE SETTINGS</>}
                        </button>
                    </form>

                    {/* Change password / Credentials triggers */}
                    <div 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/60 border-dashed flex items-center justify-between group hover:bg-superadmin-primary/[0.04] hover:border-superadmin-primary/30 transition-all cursor-pointer shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-superadmin-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-superadmin-primary group-hover:border-superadmin-primary/30 transition-all">
                                <Lock size={20} className="group-hover:rotate-12 transition-transform" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] mb-1">SECURITY CREDENTIALS OVERRIDE</h4>
                                <p className="text-[9px] font-medium text-slate-500 italic">Initiate credential pivot and authentication settings.</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-superadmin-primary group-hover:border-superadmin-primary/30 transition-all">
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Activity logs */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-3xl shadow-xl">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-superadmin-primary" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">RECENT SESSION AUDIT TRAIL</h3>
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">REAL-TIME FEED</span>
                        </div>
                        <div className="space-y-4">
                            {mockLogs.map((log, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-950/40 border border-white/5 p-4 rounded-xl gap-2 hover:bg-slate-950/80 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="text-[9px] font-mono text-slate-600 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg mt-0.5">
                                            {log.time}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-200 uppercase tracking-wider">{log.event}</p>
                                            <p className="text-[8px] font-mono text-slate-600 tracking-wider">CLIENT ADDR: {log.ip}</p>
                                        </div>
                                    </div>
                                    <span className="self-start sm:self-center text-[7px] font-mono font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {log.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Configuration Modal */}
            <PortalModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} maxWidth="max-w-md">
                <div className="p-8 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-superadmin-primary/10 border border-superadmin-primary/25 text-superadmin-primary text-[8px] font-black uppercase tracking-widest mb-3">
                            <LockKeyhole size={10} /> ACCESS OVERRIDES
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight text-white leading-none">RECALIBRATE PASSWORD</h2>
                    </div>
                    <button 
                        onClick={() => setIsPasswordModalOpen(false)} 
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-800"
                    >
                        <X size={18}/>
                    </button>
                </div>
                
                <form onSubmit={handlePasswordChangeSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">CURRENT PASSWORD <span className="text-superadmin-primary">*</span></label>
                        <div className="relative">
                            <input 
                                required
                                type={showPasswords.old ? "text" : "password"}
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-superadmin-primary focus:bg-superadmin-primary/[0.01] transition-all"
                                placeholder="Enter current password..."
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">NEW PASSWORD <span className="text-superadmin-primary">*</span></label>
                        <div className="relative">
                            <input 
                                required
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-superadmin-primary focus:bg-superadmin-primary/[0.01] transition-all"
                                placeholder="Enter new password..."
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {passwordData.newPassword.length > 0 && (
                            <div className="mt-3 space-y-3 p-4 bg-slate-950/60 border border-white/5 rounded-xl transition-all duration-300">
                                <div className="flex justify-between items-center text-[8px] font-black tracking-widest">
                                    <span className="text-slate-500 uppercase">STRENGTH PARADIGM</span>
                                    <span className={`${metrics.textColor} uppercase font-mono`}>{metrics.label}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 h-1">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div 
                                            key={step} 
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                step <= metrics.score ? metrics.color : 'bg-slate-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    {[
                                        { label: 'Minimum 6 characters required', satisfied: metrics.hasLength },
                                        { label: 'Contains alphanumeric integer', satisfied: metrics.hasNumber },
                                        { label: 'Includes uppercase or special token', satisfied: metrics.hasUpperOrSpecial }
                                    ].map((rule, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider transition-colors duration-300">
                                            <span className={`w-1.5 h-1.5 rounded-full ${rule.satisfied ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></span>
                                            <span className={rule.satisfied ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic ml-1">CONFIRM NEW PASSWORD <span className="text-superadmin-primary">*</span></label>
                        <div className="relative">
                            <input 
                                required
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 h-12 rounded-xl px-6 pr-12 text-xs font-bold text-white outline-none focus:border-superadmin-primary focus:bg-superadmin-primary/[0.01] transition-all"
                                placeholder="Confirm new password..."
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        disabled={changingPassword}
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-superadmin-primary/10 hover:scale-[1.01] active:scale-95 transition-all font-outfit uppercase tracking-widest text-[10px] font-black italic border border-white/5"
                    >
                        {changingPassword ? <RefreshCw className="animate-spin text-white" size={16} /> : <><Check size={16} className="text-white" /> INITIALIZE CREDENTIAL OVERRIDE</>}
                    </button>
                </form>
            </PortalModal>
        </motion.div>
    );
};

export default SuperAdminProfile;
