import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile, changeStudentPassword, clearStudentMessage, clearStudentError, fetchStudentFees } from '../../redux/slice/student.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, ShieldCheck, Hash, Calendar, Info, Edit3, Save, X, Lock, Camera, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading, message, error } = useSelector((state) => state.student);

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

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearStudentMessage());
            setEditMode(false);
            setPasswordModal(false);
        }
        if (error) {
            toast.error(error);
            dispatch(clearStudentError());
        }
    }, [message, error, dispatch]);

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
        dispatch(updateStudentProfile(data));
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Credentials Mismatch: Confirmation failed.");
        }
        dispatch(changeStudentPassword({
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        }));
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto font-outfit font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-outfit font-outfit">
                <div className="font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Student Profile</h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic font-outfit">View and update your personal information, contact details, and security settings.</p>
                </div>

                <div className="flex gap-4 font-outfit">
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-8 py-4 bg-luxury-emerald hover:bg-emerald-500 text-black rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-3 h-[48px] italic"
                        >
                            Edit Profile <Edit3 size={14} />
                        </button>
                    ) : (
                        <div className="flex gap-3 font-outfit">
                            <button
                                onClick={() => { setEditMode(false); setPreview(null); }}
                                className="px-6 py-4 bg-luxury-rose/10 text-luxury-rose border border-luxury-rose/20 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-luxury-rose hover:text-white transition-all h-[48px] flex items-center justify-center italic"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-8 py-4 bg-luxury-emerald text-black rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 h-[48px] italic"
                            >
                                Save Changes <Save size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 font-outfit">
                {/* Profile Card */}
                <div className="xl:col-span-1 space-y-6 font-outfit">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md relative overflow-hidden group shadow-2xl font-outfit">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-emerald/5 rounded-md blur-3xl -mr-10 -mt-10 font-outfit"></div>

                        <div className="relative z-10 text-center font-outfit">
                            <div className="w-32 h-32 mx-auto rounded-md bg-slate-800 p-1 relative mb-8 font-outfit">
                                <div className="w-full h-full overflow-hidden rounded-md border border-slate-700/50 font-outfit font-outfit">
                                    {preview || profile?.photo ? (
                                        <img src={preview || profile.photo} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 font-outfit">
                                            <User size={48} className="text-slate-600 font-outfit" />
                                        </div>
                                    )}
                                </div>

                                {editMode ? (
                                    <label htmlFor="photoUpload" className="absolute -bottom-2 -right-2 bg-luxury-emerald p-2.5 rounded-md shadow-2xl border-2 border-[#0f0f12] cursor-pointer hover:scale-110 transition-all font-outfit">
                                        <Camera size={16} className="text-black font-outfit" />
                                        <input type="file" id="photoUpload" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                ) : (
                                    <div className="absolute -bottom-2 -right-2 bg-luxury-emerald p-2 rounded-md shadow-lg border-2 border-[#0f0f12] font-outfit">
                                        <ShieldCheck size={16} className="text-white font-outfit" />
                                    </div>
                                )}
                            </div>

                            {!editMode ? (
                                <div className="font-outfit">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-outfit mb-1 italic">{profile?.firstName} {profile?.lastName}</h2>
                                    <p className="text-luxury-emerald text-[10px] font-black uppercase tracking-[0.4em] font-outfit italic mb-6">Student</p>
                                </div>
                            ) : (
                                <div className="flex gap-4 mb-6 font-outfit">
                                    <input
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        className="w-1/2 bg-slate-950/60 border border-slate-800 p-3 rounded text-sm font-bold text-white uppercase tracking-tight italic outline-none focus:border-luxury-emerald font-outfit"
                                    />
                                    <input
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleChange}
                                        className="w-1/2 bg-slate-950/60 border border-slate-800 p-3 rounded text-sm font-bold text-white uppercase tracking-tight italic outline-none focus:border-luxury-emerald font-outfit"
                                    />
                                </div>
                            )}

                            <div className="inline-flex items-center gap-3 bg-slate-950/60 px-5 py-2.5 rounded-md border border-slate-800/60 shadow-inner font-outfit">
                                <Hash size={14} className="text-slate-600 font-outfit font-outfit" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">Admission No: {profile?.admissionNumber || 'Not Assigned'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 p-8 rounded-md shadow-2xl font-outfit">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-3 italic font-outfit">
                            <div className="h-px w-6 bg-slate-800 font-outfit font-outfit"></div> Academic Information
                        </h3>
                        <div className="space-y-4 font-outfit">
                            <div className="flex justify-between items-center bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit font-outfit">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Grade</span>
                                <span className="text-sm font-black text-white italic tracking-wider">Standard {profile?.classSection?.standardId?.level || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit font-outfit">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Section</span>
                                <span className="text-sm font-black text-white italic tracking-wider">Section {profile?.classSection?.sectionLabel || 'A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit font-outfit">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Roll Number</span>
                                <span className="text-sm font-black text-white italic tracking-wider">#{profile?.rollNumber || '00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="xl:col-span-2 space-y-8 font-outfit font-outfit">
                    {/* Security Hub - Persistent Form */}
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl relative overflow-hidden group font-outfit">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all font-outfit">
                            <ShieldCheck size={120} />
                        </div>

                        {/* Financial Ledger Section */}
                        <div className="relative z-10 mb-12 font-outfit font-outfit">
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-primary mb-8 italic border-b border-slate-800/60 pb-6 font-outfit">Fee Payment Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-outfit font-outfit">
                                <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md group hover:border-brand-primary/30 transition-all shadow-inner font-outfit font-outfit">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Status</p>
                                    <div className="flex items-center gap-3 font-outfit">
                                        <div className={`w-2 h-2 rounded-full ${profile?.feeStatus === 'paid' ? 'bg-luxury-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-luxury-rose shadow-[0_0_10px_rgba(244,63,94,0.5)] font-outfit'}`}></div>
                                        <p className="text-xl font-black text-white font-outfit italic uppercase tracking-wider">{profile?.feeStatus || 'Pending'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-md group hover:border-brand-primary/30 transition-all shadow-inner font-outfit font-outfit">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Academic Year</p>
                                    <p className="text-xl font-black text-white font-outfit italic uppercase tracking-wider font-outfit">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 font-outfit font-outfit">
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-luxury-rose mb-12 italic border-b border-slate-800/60 pb-6 font-outfit">Security & Password</h3>

                            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-8 font-outfit font-outfit">
                                <div className="space-y-4 font-outfit">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={passData.oldPassword}
                                        onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-white outline-none focus:border-luxury-rose shadow-inner text-sm font-black tracking-[0.3em] font-outfit"
                                    />
                                </div>
                                <div className="space-y-4 font-outfit">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={passData.newPassword}
                                        onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-white outline-none focus:border-luxury-emerald shadow-inner text-sm font-black tracking-[0.3em] font-outfit"
                                    />
                                </div>
                                <div className="space-y-4 font-outfit">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={passData.confirmPassword}
                                        onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-white outline-none focus:border-luxury-emerald shadow-inner text-sm font-black tracking-[0.3em] font-outfit"
                                    />
                                </div>

                                <div className="md:col-span-3 flex justify-end pt-6 font-outfit">
                                    <button
                                        type="submit"
                                        className="px-10 py-5 bg-luxury-emerald text-white rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-brand-primary active:scale-95 flex items-center justify-center gap-4 italic h-[52px] font-outfit"
                                    >
                                        Update Password <CheckCircle size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl relative font-outfit font-outfit">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-luxury-emerald mb-12 italic border-b border-slate-800/60 pb-6 font-outfit">Personal Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-outfit">
                            <div className="space-y-4 font-outfit">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Date of Birth</label>
                                {!editMode ? (
                                    <div className="flex items-center gap-5 text-white bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit font-outfit">
                                        <Calendar size={20} className="text-luxury-emerald opacity-60 font-outfit" />
                                        <span className="font-bold text-lg italic tracking-widest font-outfit">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                ) : (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth?.split('T')[0] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-sm font-black text-white uppercase outline-none focus:border-luxury-emerald font-outfit"
                                    />
                                )}
                            </div>

                            <div className="space-y-4 font-outfit">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Gender</label>
                                {!editMode ? (
                                    <div className="flex items-center gap-5 text-white bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit">
                                        <User size={20} className="text-luxury-emerald opacity-60 font-outfit" />
                                        <span className="font-bold text-lg uppercase tracking-widest italic font-outfit">{profile?.gender || 'Unknown'}</span>
                                    </div>
                                ) : (
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-sm font-black text-white uppercase outline-none focus:border-luxury-emerald font-outfit"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                )}
                            </div>

                            <div className="space-y-4 md:col-span-2 font-outfit">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Permanent Address</label>
                                {!editMode ? (
                                    <div className="flex items-center gap-5 text-white bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit">
                                        <MapPin size={20} className="text-luxury-rose opacity-60 font-outfit" />
                                        <span className="font-medium text-slate-300 italic tracking-wide font-outfit">{profile?.address || 'Address not provided'}</span>
                                    </div>
                                ) : (
                                    <textarea
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-sm font-medium text-white italic outline-none focus:border-luxury-emerald h-32 resize-none font-outfit"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl relative overflow-hidden font-outfit">
                        <div className="absolute top-0 right-0 p-8 opacity-5 font-outfit">
                            <ShieldCheck size={120} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-brand-primary mb-12 italic border-b border-slate-800/60 pb-6 font-outfit">Guardian Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-outfit font-outfit">
                            <div className="space-y-4 font-outfit">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Guardian's Name</label>
                                {!editMode ? (
                                    <div className="flex items-center gap-5 text-white bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit font-outfit">
                                        <div className="p-3 bg-brand-primary/10 rounded-md"><ShieldCheck size={20} className="text-brand-primary font-outfit" /></div>
                                        <span className="font-bold text-lg italic tracking-tighter uppercase font-outfit">{profile?.guardianName || 'N/A'}</span>
                                    </div>
                                ) : (
                                    <input
                                        name="guardianName"
                                        value={formData.guardianName || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-sm font-black text-white uppercase italic outline-none focus:border-brand-primary font-outfit"
                                    />
                                )}
                            </div>
                            <div className="space-y-4 font-outfit">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic block ml-1 font-outfit">Guardian's Contact</label>
                                {!editMode ? (
                                    <div className="flex items-center gap-5 text-white bg-slate-950/40 p-5 rounded-md border border-slate-800/40 font-outfit">
                                        <div className="p-3 bg-luxury-emerald/10 rounded-md"><Phone size={20} className="text-luxury-emerald font-outfit" /></div>
                                        <span className="font-black text-lg tracking-[0.15em] font-outfit">{profile?.guardianContact || 'N/A'}</span>
                                    </div>
                                ) : (
                                    <input
                                        name="guardianContact"
                                        value={formData.guardianContact || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-md text-sm font-black text-white tracking-[0.2em] outline-none focus:border-brand-primary font-outfit"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default StudentProfile;
