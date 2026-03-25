import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Award, Calendar, ShieldCheck, Camera, Loader2, Key } from 'lucide-react';
import { fetchProfile, updateProfile, changeTeacherPassword } from '../../redux/slice/teacher.slice';
import Modal from '../../components/Modal';

const TeacherProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading, message } = useSelector((state) => state.teacher);

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

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return alert("Passwords don't match");
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
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-md bg-slate-800 border-4 border-slate-900 shadow-2xl overflow-hidden relative">
                            {photoPreview ? (
                                <img src={photoPreview} alt="profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-4xl font-outfit">
                                    {profile?.firstName?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary hover:bg-teacher-primary rounded-md flex items-center justify-center cursor-pointer shadow-xl border-4 border-brand-background transition-all hover:scale-110 z-10">
                            <Camera size={18} className="text-white" />
                            <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                        </label>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 font-outfit">Identification <br /> Matrix</h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Employee ID: <span className="text-brand-primary">{profile?.employeeId || 'SYS-LOAD'}</span></p>
                    </div>
                </div>
                <button onClick={() => setModalType('password')} className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 rounded-md font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:border-brand-primary/40 transition-all shadow-2xl group">
                    <Key size={16} className="group-hover:rotate-12 transition-transform" /> Rotational Security Update
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdate} className="bg-slate-900/40 border border-slate-800/80 rounded-md p-10 shadow-2xl space-y-10 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Given Name</label>
                                <input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Family Name</label>
                                <input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Institutional Telecommunications (Phone)</label>
                            <input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Academic Qualifications (Comma Separated)</label>
                            <textarea
                                rows={3}
                                value={formData.qualifications}
                                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium resize-none"
                            />
                        </div>

                        <button type="submit" className="w-full py-5 bg-brand-primary hover:bg-teacher-primary rounded-md font-black text-xs uppercase tracking-[0.4em] text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="animate-spin" /> : 'Synchronize Identity Records'}
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-primary/10 border border-slate-800/80 rounded-md p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-8 font-outfit">Verified Metadata</h3>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-md bg-slate-800 flex items-center justify-center text-brand-primary shadow-lg border border-slate-700">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Direct Address</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tighter">{profile?.userId?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-md bg-slate-800 flex items-center justify-center text-luxury-emerald shadow-lg border border-slate-700">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Activation Term</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tighter">{profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'INITIALIZED'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-md bg-slate-800 flex items-center justify-center text-brand-secondary shadow-lg border border-slate-700">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Clearance Level</p>
                                    <p className="text-sm font-bold text-white uppercase tracking-tighter italic">{profile?.userId?.role || 'TEACHER'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-800">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic">Pedagogical Credentials</p>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(profile?.qualifications) && profile.qualifications.map(q => (
                                    <span key={q} className="bg-slate-800 px-3 py-1.5 rounded-md text-[9px] font-black text-brand-primary uppercase tracking-widest border border-slate-700/50">
                                        {q}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={modalType === 'password'} onClose={() => setModalType(null)} title="Security Protocol Update">
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Current Code</label>
                        <input
                            type="password"
                            required
                            value={passData.oldPassword}
                            onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">New Encryption Key</label>
                        <input
                            type="password"
                            required
                            value={passData.newPassword}
                            onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Confirm Key</label>
                        <input
                            type="password"
                            required
                            value={passData.confirmPassword}
                            onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-6 py-4 text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 border border-slate-800 hover:border-brand-primary/40 rounded-md font-black text-xs uppercase tracking-[0.4em] text-white transition-all shadow-2xl active:scale-95">
                        Commit Security Rotation
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherProfile;
