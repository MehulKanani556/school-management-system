import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile, changeStudentPassword, fetchStudentFees } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, ShieldCheck, Hash, Calendar, Edit3, Save, X, Lock, Camera, CheckCircle, Fingerprint, CreditCard, AlertTriangle, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { profile, fees, loading } = useSelector((state) => state.student);
    
    // Calculate global fee status from fetched ledger
    const overallFeeStatus = fees?.length > 0 
        ? (fees.every(f => f.status === 'paid') ? 'Paid' : 'Pending')
        : 'N/A';

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
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
            toast.success("Profile updated successfully!");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Passwords do not match.");
        }
        const res = await dispatch(changeStudentPassword({
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        }));
        if (!res.error) {
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            toast.success("Password changed successfully!");
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-[400px] flex items-center justify-center font-outfit">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8 pb-16 font-outfit text-slate-200"
        >
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl p-6 md:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-lg relative group">
                                {preview || profile?.photo ? (
                                    <img src={preview || profile.photo} alt="Student Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                                        <User size={40} className="text-slate-500" />
                                    </div>
                                )}
                                {editMode && (
                                    <label className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <Camera className="text-white mb-1" size={20} />
                                        <span className="text-[9px] uppercase tracking-wider text-white font-bold">Upload</span>
                                        <input type="file" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-slate-950">
                                <ShieldCheck size={16} className="text-white" />
                            </div>
                        </div>

                        {/* Text Details */}
                        <div className="text-center md:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                    Verified Student
                                </span>
                                <span className="px-2.5 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                                    Active Session
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                {profile?.firstName} {profile?.lastName}
                            </h1>
                            <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-2">
                                <GraduationCap size={16} className="text-brand-primary" />
                                Standard {profile?.classSection?.standardId?.level || 'N/A'} • Section {profile?.classSection?.sectionLabel || 'A'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-brand-primary/10"
                            >
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditMode(false); setPreview(null); }}
                                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10"
                                >
                                    <Save size={14} /> Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Meta stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-900 text-left">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Admission ID</p>
                        <p className="text-sm font-bold text-white mt-0.5">{profile?.admissionNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Roll Number</p>
                        <p className="text-sm font-bold text-white mt-0.5">#{profile?.rollNumber || '00'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Academic Year</p>
                        <p className="text-sm font-bold text-white mt-0.5">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Registration Date</p>
                        <p className="text-sm font-bold text-white mt-0.5">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Financial Status */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4 text-left">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                            <CreditCard size={16} /> Account & Fees
                        </h3>
                        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Status</p>
                                <p className="text-lg font-bold text-white mt-0.5">{overallFeeStatus}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overallFeeStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {overallFeeStatus === 'Paid' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-5 text-left">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                            <Lock size={16} /> Security Settings
                        </h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                    className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 p-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                    className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 p-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passData.confirmPassword}
                                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 p-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 border border-rose-500/20"
                            >
                                Update Security Signature
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right / Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Registry */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl shadow-xl space-y-6 text-left">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                                <User size={16} /> Personal Information
                            </h3>
                            <span className="text-[9px] text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
                                PROFILE_RECORD
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">First Name</label>
                                {!editMode ? (
                                    <div className="text-sm font-bold text-white bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900">
                                        {profile?.firstName || 'N/A'}
                                    </div>
                                ) : (
                                    <input
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all"
                                        placeholder="First Name"
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Last Name</label>
                                {!editMode ? (
                                    <div className="text-sm font-bold text-white bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900">
                                        {profile?.lastName || 'N/A'}
                                    </div>
                                ) : (
                                    <input
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all"
                                        placeholder="Last Name"
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Email Address</label>
                                {!editMode ? (
                                    <div className="text-sm font-bold text-slate-300 bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-500" />
                                        {profile?.email || 'N/A'}
                                    </div>
                                ) : (
                                    <input
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all"
                                        placeholder="Email Address"
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Date of Birth</label>
                                {!editMode ? (
                                    <div className="text-sm font-bold text-white bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900 flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500" />
                                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </div>
                                ) : (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth?.split('T')[0] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all"
                                    />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Gender</label>
                                {!editMode ? (
                                    <div className="text-sm font-bold text-white bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900 flex items-center gap-2">
                                        <Fingerprint size={14} className="text-slate-500" />
                                        {profile?.gender || 'N/A'}
                                    </div>
                                ) : (
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Home Address</label>
                                {!editMode ? (
                                    <div className="text-sm text-slate-300 bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-900 flex items-start gap-2">
                                        <MapPin size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                                        {profile?.address || 'Address details not available'}
                                    </div>
                                ) : (
                                    <textarea
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary p-3 rounded-xl text-white text-sm outline-none transition-all resize-none"
                                        placeholder="Home Address"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guardian Info */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-8 rounded-2xl shadow-xl space-y-6 text-left">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                            <ShieldCheck size={16} /> Guardian Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Guardian Name</p>
                                    <p className="text-sm font-bold text-slate-200 mt-0.5">{profile?.guardianName || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Contact Number</p>
                                    <p className="text-sm font-bold text-slate-200 mt-0.5">{profile?.guardianContact || 'N/A'}</p>
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
