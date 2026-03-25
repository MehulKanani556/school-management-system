import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeProfileModal } from '../redux/slice/ui.slice';
import Modal from './Modal';
import axiosInstance from '../utils/axiosInstance';
import { Mail, Phone, Calendar, User, Shield, GraduationCap, Building2, MessageCircle, UserCircle, MapPin, Briefcase, Award, ArrowRight, UserCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileModal = () => {
    const dispatch = useDispatch();
    const { open, userId } = useSelector(state => state.ui.profileModal);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && userId) {
            fetchProfile();
        } else {
            setProfile(null);
            setError(null);
        }
    }, [open, userId]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/users/${userId}/profile`);
            if (response.data.success) {
                setProfile(response.data);
            } else {
                setError(response.data.message || 'Institutional search failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Platform synchronization error.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => dispatch(closeProfileModal());

    const ProfileField = ({ icon: Icon, label, value, color = "text-slate-400" }) => (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all">
            <div className="p-2.5 rounded-md bg-slate-800/50 text-student-primary shadow-inner">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-sm font-bold ${color}`}>{value || '---'}</p>
            </div>
        </div>
    );

    const renderRolesSpecifics = (role, data) => {
        switch (role) {
            case 'Student':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <ProfileField icon={GraduationCap} label="Standard / Grade" value={data.standard?.level || data.standard?.name} />
                        <ProfileField icon={Building2} label="Class Section" value={data.classSection?.sectionLabel} />
                        <ProfileField icon={Shield} label="Admission No." value={data.admissionNumber} color="text-emerald-400 font-mono" />
                        <ProfileField icon={Award} label="Scholarship" value={`${data.scholarshipPercentage}% Waiver`} />
                        <ProfileField icon={UserCircle} label="Guardian" value={data.guardianName} />
                        <ProfileField icon={MessageCircle} label="Guardian Email" value={data.guardianEmail} />
                    </div>
                );
            case 'Teacher':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <ProfileField icon={Briefcase} label="Employee ID" value={data.employeeId} color="text-blue-400 font-mono" />
                        <ProfileField icon={Calendar} label="Joining Date" value={data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A'} />
                        <ProfileField icon={Activity} label="Status" value={data.isActive ? "Active Node" : "Suspended"} color={data.isActive ? "text-emerald-400" : "text-red-400"} />
                        <ProfileField icon={Mail} label="Professional Email" value={data.email} />
                    </div>
                );
            case 'Parent':
                return (
                    <div className="mt-6 space-y-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Registered Dependents</div>
                        {data.children?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {data.children.map(child => (
                                    <div key={child._id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-900 border border-emerald-500/20">
                                        <img src={child.photo || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{child.firstName} {child.lastName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{child.admissionNumber}</p>
                                        </div>
                                        <div className="text-[9px] font-black text-emerald-500 uppercase border border-emerald-500/30 px-2 py-1 rounded">Linked Student</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-slate-900/40 text-center text-xs text-slate-500 italic">No dependents linked to this parent account.</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal open={open} onClose={handleClose} title="Institutional Identity Hub" maxWidth="max-w-2xl">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center space-y-4"
                    >
                        <div className="w-12 h-12 border-4 border-student-primary/20 border-t-student-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Cryptographic Identity...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="py-12 text-center"
                    >
                        <Shield className="mx-auto text-red-500/40 mb-4" size={48} />
                        <p className="text-sm text-red-400 font-bold">{error}</p>
                        <button onClick={fetchProfile} className="mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-white underline tracking-widest">Retry Synchronization</button>
                    </motion.div>
                ) : profile ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Header Header */}
                        <div className="flex items-center gap-6 p-6 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/5 relative overflow-hidden group">
                           
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <UserCircle size={120} />
                            </div>

                            <div className="relative">
                                <img 
                                    src={profile.data.photo || 'https://via.placeholder.com/150'} 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-2xl relative z-10" 
                                    alt="" 
                                />
                                <div className="absolute inset-0 rounded-full bg-student-primary blur-lg opacity-20 -z-0" />
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-black text-white">{profile.data.firstName} {profile.data.lastName}</h3>
                                    <span className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
                                        {profile.role}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Mail size={14} className="text-slate-600" />
                                        <span>{profile.data.email || 'No Email'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <MapPin size={14} className="text-slate-600" />
                                        <span>{profile.data.address || 'Location Hidden'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specific Content */}
                        <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                             {renderRolesSpecifics(profile.role, profile.data)}
                             
                             {/* Institutional Context */}
                             <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-900/20 border border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Affiliated Institution</p>
                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Building2 size={12} className="text-student-primary" />
                                        {profile.data.schoolId?.name || 'Central Platform Hub'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/20 border border-white/5">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Account Presence Since</p>
                                    <p className="text-sm font-bold text-slate-400">
                                        {profile.data.createdAt ? new Date(profile.data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Alpha Records'}
                                    </p>
                                </div>
                             </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex gap-4 pt-4">
                            <button className="flex-1 py-4 flex items-center justify-center gap-3 rounded-md bg-student-primary text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">
                                <MessageCircle size={16} />
                                Initialize Direct Comms
                            </button>
                            <button 
                                onClick={handleClose} 
                                className="px-6 py-4 rounded-md border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                            >
                                Dispatch Hub
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </Modal>
    );
};

export default ProfileModal;
