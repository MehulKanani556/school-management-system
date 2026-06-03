import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Award, Calendar, ShieldCheck, Camera, Loader2, Key } from 'lucide-react';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { fetchProfile, updateProfile, changeTeacherPassword } from '../../redux/slice/teacher.slice';

const TeacherProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading, message, error } = useSelector((state) => state.teacher);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        qualifications: ''
    });

    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [modalType, setModalType] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);


    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phone: profile.phone || '',
                qualifications: Array.isArray(profile.qualifications) ? profile.qualifications.join(', ') : ''
            });
            setPhotoPreview(profile.userId?.photo);
        }
    }, [profile]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (photoFile) data.append('photo', photoFile);
        dispatch(updateProfile(data));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return await alert("Passwords don't match");
        dispatch(changeTeacherPassword({ oldPassword: passData.oldPassword, newPassword: passData.newPassword }));
        setModalType(null);
    };

    if (loading && !profile) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Retrieving Personal Cryptography</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Profile Cover & Header Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-slate-950 shadow-2xl">
                {/* Visual Banner Background */}
                <div className="h-40 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-brand-primary/10 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
                </div>

                {/* Banner Content Layer */}
                <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        {/* Profile Picture Frame */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden relative flex items-center justify-center ring-4 ring-teacher-primary/20 group-hover:ring-teacher-primary/50 transition-all duration-300">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-extrabold text-5xl font-outfit">
                                        {profile?.firstName?.charAt(0)}
                                    </div>
                                )}
                                {/* Overlay hover edit state */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">Change</span>
                                </div>
                            </div>
                            <label className="absolute bottom-1 right-1 w-9 h-9 bg-teacher-primary hover:bg-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-xl border-2 border-slate-950 transition-all hover:scale-110 z-20">
                                <Camera size={16} className="text-white" />
                                <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                            </label>
                        </div>

                        {/* Name and ID Info */}
                        <div className="mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
                                <h1 className="text-3xl font-black text-white tracking-tight font-outfit uppercase">
                                    {profile?.firstName} {profile?.lastName}
                                </h1>
                                <span className="flex items-center justify-center bg-emerald-500/10 text-emerald-400 p-1.5 rounded-full border border-emerald-500/20 shadow-md" title="Verified Account">
                                    <ShieldCheck size={14} />
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="bg-slate-900 border border-slate-800 px-3.5 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Employee ID: <span className="text-teacher-primary">{profile?.employeeId || 'SYS-LOAD'}</span>
                                </span>
                                <span className="bg-teacher-primary/10 border border-teacher-primary/20 px-3.5 py-1 rounded-full text-[10px] font-black text-teacher-primary uppercase tracking-wider">
                                    {profile?.userId?.role || 'TEACHER'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setModalType('password')} 
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white hover:border-teacher-primary/40 hover:bg-slate-900/80 transition-all shadow-xl group"
                    >
                        <Key size={14} className="group-hover:rotate-12 transition-transform text-teacher-primary" /> 
                        Change Password
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Form (Left Column) */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleUpdate} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60">
                            <div className="p-2 bg-teacher-primary/10 rounded-lg text-teacher-primary">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Personal Details</h3>
                                <p className="text-xs text-slate-500">Update your public profile details and contact information.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <User size={16} />
                                    </div>
                                    <input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                                        placeholder="Enter first name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Last Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <User size={16} />
                                    </div>
                                    <input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Phone size={16} />
                                </div>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Academic Credentials & Qualifications</label>
                            <div className="relative">
                                <div className="absolute top-4 left-0 pl-4 pointer-events-none text-slate-500">
                                    <Award size={16} />
                                </div>
                                <textarea
                                    rows={3}
                                    value={formData.qualifications}
                                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm resize-none"
                                    placeholder="Enter qualifications (e.g., MCA, B.Ed, PhD)"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-teacher-primary hover:bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>

                {/* Sidebar Details (Right Column) */}
                <div className="space-y-6">
                    {/* Card 1: Administrative Verification */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teacher-primary/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-white uppercase tracking-tight">Verification Records</h3>
                                <p className="text-[10px] text-slate-500">Official registry records.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-teacher-primary shrink-0 border border-slate-800">
                                    <Mail size={16} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                                    <p className="text-xs font-bold text-white select-all break-all">{profile?.userId?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-800">
                                    <Calendar size={16} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Joining Date</p>
                                    <p className="text-xs font-bold text-white">{profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-indigo-400 shrink-0 border border-slate-800">
                                    <ShieldCheck size={16} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Access Level</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{profile?.userId?.role || 'TEACHER'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Academic Qualifications List */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Award size={20} />
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-white uppercase tracking-tight">Credentials</h3>
                                <p className="text-[10px] text-slate-500">Certified teaching disciplines.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                            {Array.isArray(profile?.qualifications) && profile.qualifications.length > 0 ? (
                                profile.qualifications.map(q => (
                                    <span key={q} className="bg-teacher-primary/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-teacher-primary uppercase tracking-wider border border-teacher-primary/20 shadow-sm">
                                        {q}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-slate-600 italic">No qualifications listed</p>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Security & Access */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/60 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-teacher-primary">
                                <Key size={20} />
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-white uppercase tracking-tight">Security</h3>
                                <p className="text-[10px] text-slate-500">Manage account access keys.</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-2">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Keep your credential signatures secure. It is recommended to rotate your password periodically.
                            </p>
                            <button 
                                onClick={() => setModalType('password')} 
                                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teacher-primary/30 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Key size={14} className="text-teacher-primary" /> Rotate Password Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Modal open={modalType === 'password'} onClose={() => setModalType(null)} title="Change Account Password">
                <form onSubmit={handleChangePassword} className="space-y-5 pt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Current Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Key size={16} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Enter current password"
                                value={passData.oldPassword}
                                onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Key size={16} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Enter new password"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Key size={16} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Confirm new password"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-teacher-primary/80 focus:ring-4 focus:ring-teacher-primary/10 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-2 py-4 bg-teacher-primary hover:bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]">
                        Update Password
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherProfile;
