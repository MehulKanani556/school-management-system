import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile, changeStudentPassword, fetchStudentFees } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, ShieldCheck, Hash, Calendar, Info, Edit3, Save, X, Lock, Camera, CheckCircle, Fingerprint, CreditCard, AlertTriangle, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { profile, fees, loading, message, error } = useSelector((state) => state.student);
    
    // Calculate global fee status from fetched ledger
    const overallFeeStatus = fees?.length > 0 
        ? (fees.every(f => f.status === 'paid') ? 'Paid' : 'Pending')
        : 'N/A';

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordModal, setPasswordModal] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        dispatch(fetchStudentProfile());
        dispatch(fetchStudentFees());
    }, [dispatch]);

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photoFile: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'photoFile') data.append('photo', formData[key]);
            else if (typeof formData[key] !== 'object') data.append(key, formData[key]);
        });
        const res = await dispatch(updateStudentProfile(data));
        if (!res.error) {
            setEditMode(false);
            setPreview(null);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Credentials Mismatch: Confirmation failed.");
        }
        const res = await dispatch(changeStudentPassword({
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        }));
        if (!res.error) {
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-[400px] flex items-center justify-center font-outfit">
                <div className="w-12 h-12 border-4 border-luxury-emerald/20 border-t-luxury-emerald rounded-md animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-12 pb-20 font-outfit"
        >
            {/* High-Fidelity Profile Header Banner */}
            <div className="relative group overflow-hidden rounded-md border border-slate-800 shadow-2xl bg-slate-950">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 via-slate-950 to-luxury-emerald/20 opacity-40 group-hover:opacity-60 transition-all duration-700"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-luxury-emerald/10 rounded-full blur-[120px]"></div>
                
                <div className="relative z-10 p-12 flex flex-col md:flex-row items-center gap-10">
                    {/* Avatar System */}
                    <div className="relative group">
                        <div className="w-44 h-44 rounded-md bg-slate-800 p-1.5 shadow-2xl transform transition-transform group-hover:scale-[1.02]">
                            <div className="w-full h-full rounded-md overflow-hidden bg-slate-900 border border-slate-700/50 relative">
                                {preview || profile?.photo ? (
                                    <img src={preview || profile.photo} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <User size={64} className="text-slate-600" />
                                    </div>
                                )}
                                {editMode && (
                                    <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                                        <Camera className="text-white mb-2" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload New</span>
                                        <input type="file" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-luxury-emerald rounded-md flex items-center justify-center shadow-xl border-4 border-slate-950 group-hover:rotate-12 transition-transform">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-md italic">Student Identity</span>
                                <span className="px-3 py-1 bg-luxury-emerald/10 border border-luxury-emerald/30 text-luxury-emerald text-[10px] font-black uppercase tracking-widest rounded-md italic">Verified Academic</span>
                            </div>
                            <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">{profile?.firstName} {profile?.lastName}</h1>
                            <p className="text-slate-500 font-bold text-xl flex items-center justify-center md:justify-start gap-3 italic tracking-tight">
                                <GraduationCap size={20} className="text-brand-primary" />
                                Standard {profile?.classSection?.standardId?.level || 'N/A'} - Section {profile?.classSection?.sectionLabel || 'A'}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                            <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-3 rounded-md border border-slate-800 shadow-inner">
                                <Hash size={14} className="text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Admission: {profile?.admissionNumber || 'ADM-2024-XXX'}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-3 rounded-md border border-slate-800 shadow-inner">
                                <Fingerprint size={14} className="text-slate-600" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Roll No: #{profile?.rollNumber || '00'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 self-center md:self-end">
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-8 py-4 bg-brand-primary text-black rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white active:scale-95 flex items-center gap-4 italic shadow-lg shadow-brand-primary/20"
                            >
                                Edit Profile <Edit3 size={16} />
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setEditMode(false); setPreview(null); }}
                                    className="px-8 py-4 bg-slate-800 text-white rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-700 italic border border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-8 py-4 bg-luxury-emerald text-white rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-black italic shadow-lg shadow-luxury-emerald/20 flex items-center gap-4"
                                >
                                    Save Changes <CheckCircle size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Command Center Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Side: Specialized Data Quadrants */}
                <div className="space-y-12">
                    {/* Financial Status DNA */}
                    <div className="bg-[#0f0f12] border border-slate-800/80 p-8 rounded-md shadow-2xl relative group overflow-hidden text-left">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <CreditCard size={120} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-primary mb-8 italic border-b border-slate-800/60 pb-5">Financial DNA</h3>
                        
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-950/60 rounded-md border border-slate-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Current Status</p>
                                    <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{overallFeeStatus}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-md flex items-center justify-center ${overallFeeStatus === 'Paid' ? 'bg-luxury-emerald/10 text-luxury-emerald' : 'bg-luxury-rose/10 text-luxury-rose'}`}>
                                    {overallFeeStatus === 'Paid' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                                </div>
                            </div>
                            
                            <div className="">
                                <div className="p-4 bg-slate-950/60 rounded-md border border-slate-800">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic mb-2">Academic Year</p>
                                    <p className="text-sm font-black text-white italic tracking-widest">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                                </div>
                            
                            </div>
                        </div>
                    </div>

                    {/* Security Vector Grid */}
                    <div className="bg-[#0f0f12] border border-slate-800/80 p-8 rounded-md shadow-2xl relative overflow-hidden group text-left">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Lock size={120} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-luxury-rose mb-8 italic border-b border-slate-800/60 pb-5">Security Vector</h3>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Current Signature</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-luxury-rose transition-colors text-sm tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">New Signature</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-luxury-emerald transition-colors text-sm tracking-widest"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-luxury-rose/10 text-luxury-rose rounded-md text-[10px] font-black uppercase tracking-[0.3em] hover:bg-luxury-rose hover:text-white transition-all border border-luxury-rose/30 italic"
                            >
                                Authenticate Security Wipe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Center & Right Combined: Institutional Profile Details */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Personal Registry Card */}
                    <div className="bg-[#0f0f12] border border-slate-800/80 p-10 rounded-md shadow-2xl relative group text-left">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-95 transition-transform duration-1000">
                            <User size={160} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-primary mb-12 italic border-b border-slate-800/60 pb-6 flex items-center justify-between">
                            Personal Registry
                            <span className="text-[9px] text-slate-600 tracking-normal font-bold bg-slate-900 px-3 py-1 rounded-md border border-slate-800">RECORD_TYPE: PRIMARY_SENSITIVE</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10 text-left">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Legal Birth Name</label>
                                {!editMode ? (
                                    <div className="text-xl font-black text-white italic tracking-tight uppercase border-b border-slate-800/30 pb-2 flex items-center gap-3">
                                        <User size={16} className="text-brand-primary opacity-60" />
                                        {profile?.firstName} {profile?.lastName}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            name="firstName"
                                            value={formData.firstName || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-brand-primary h-[54px]"
                                            placeholder="First Name"
                                        />
                                        <input
                                            name="lastName"
                                            value={formData.lastName || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-brand-primary h-[54px]"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Institutional Alias (Email)</label>
                                {!editMode ? (
                                    <div className="text-xl font-black text-slate-400 italic tracking-tight border-b border-slate-800/30 pb-2 flex items-center gap-3 text-left">
                                        <Mail size={16} className="text-brand-primary opacity-60" />
                                        {profile?.email || 'N/A'}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary opacity-60" />
                                        <input
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-md text-white outline-none focus:border-brand-primary h-[54px] italic"
                                            placeholder="Update active email address..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Temporal Origin (Birthday)</label>
                                {!editMode ? (
                                    <div className="text-xl font-black text-white italic tracking-tight border-b border-slate-800/30 pb-2 flex items-center gap-3 uppercase text-left">
                                        <Calendar size={16} className="text-luxury-emerald opacity-60" />
                                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'NOT RECORDED'}
                                    </div>
                                ) : (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth?.split('T')[0] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-luxury-emerald h-[54px]"
                                    />
                                )}
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Gender Identification</label>
                                {!editMode ? (
                                    <div className="text-xl font-black text-white italic tracking-tight border-b border-slate-800/30 pb-2 flex items-center gap-3 uppercase text-left">
                                        <Fingerprint size={16} className="text-luxury-rose opacity-60" />
                                        {profile?.gender || 'UNKNOWN'}
                                    </div>
                                ) : (
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 p-4 rounded-md text-white outline-none focus:border-luxury-emerald h-[54px] uppercase font-black"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-4 md:col-span-2 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Geolocation Coordinate (Address)</label>
                                {!editMode ? (
                                    <div className="text-lg font-medium text-slate-400 italic tracking-wide flex items-start gap-3 pt-2 text-left">
                                        <MapPin size={16} className="text-brand-primary flex-shrink-0 mt-1" />
                                        {profile?.address || 'Geolocation data unavailable'}
                                    </div>
                                ) : (
                                    <textarea
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 p-5 rounded-md text-white outline-none focus:border-brand-primary h-24 resize-none italic"
                                        placeholder="Enter full physical address..."
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guardian Defense Node */}
                    <div className="bg-[#0f0f12] border border-slate-800/80 p-10 rounded-md shadow-2xl relative overflow-hidden group text-left">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <ShieldCheck size={140} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-luxury-emerald mb-12 italic border-b border-slate-800/60 pb-6">Guardian Network</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Primary Guardian</label>
                                <div className="p-6 bg-slate-950/40 rounded-md border border-slate-800/50 flex items-center gap-5 opacity-80 cursor-not-allowed">
                                    <div className="w-12 h-12 rounded-md bg-luxury-emerald/5 flex items-center justify-center text-luxury-emerald/40 border border-luxury-emerald/10">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-400 italic uppercase tracking-tighter">{profile?.guardianName || 'N/A'}</p>
                                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Administrative Lead</p>
                                    </div>
                                    <div className="ml-auto opacity-20">
                                        <Lock size={14} className="text-slate-500" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic block">Secure Contact Link</label>
                                <div className="p-6 bg-slate-950/40 rounded-md border border-slate-800/50 flex items-center gap-5 opacity-80 cursor-not-allowed">
                                    <div className="w-12 h-12 rounded-md bg-brand-primary/5 flex items-center justify-center text-brand-primary/40 border border-brand-primary/10">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-400 tracking-[0.2em]">{profile?.guardianContact || 'N/A'}</p>
                                        <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Emergency Priority</p>
                                    </div>
                                    <div className="ml-auto opacity-20">
                                        <Lock size={14} className="text-slate-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentProfile;
