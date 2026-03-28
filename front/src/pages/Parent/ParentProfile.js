import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../utils/axiosInstance';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, CheckCircle, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { updateUser } from '../../redux/slice/auth.slice';

const ParentProfile = () => {
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const dispatch = useDispatch();

    console.log(user);

    const profileFormik = useFormik({
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            address: user?.address || '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('First name is required'),
            lastName: Yup.string().required('Last name is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('firstName', values.firstName);
                formData.append('lastName', values.lastName);
                formData.append('phoneNumber', values.phoneNumber);
                formData.append('address', values.address);
                if (fileInputRef.current?.files[0]) {
                    formData.append('photo', fileInputRef.current.files[0]);
                }

                const res = await axiosInstance.put('/parent/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                dispatch(updateUser(res.data.user));
                setPreviewUrl(null);
                setRefreshKey(Date.now());
                setMessage('Guardian profile synchronized successfully');
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Update failed');
                setLoading(false);
            }
        }
    });

    const handlePhotoClick = () => fileInputRef.current?.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const passFormik = useFormik({
        initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
        validationSchema: Yup.object({
            oldPassword: Yup.string().required('Old password is required'),
            newPassword: Yup.string().min(6, 'Min 6 characters').required('New password is required'),
            confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Confirm password'),
        }),
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                await axiosInstance.post('/parent/change-password', values);
                setMessage('Password updated successfully');
                resetForm();
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Password update failed');
                setLoading(false);
            }
        }
    });

    const ic = "mt-1.5 w-full bg-slate-900/50 border border-slate-700/50 focus:border-brand-primary rounded-md py-3 px-4 text-white placeholder-slate-600 outline-none text-sm transition-all";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">My Profile & Security</h1>
                <p className="text-slate-500 text-sm italic">Manage your guardian account settings and credentials</p>
            </div>

            {(message || error) && (
                <div className={`p-4 rounded-md flex items-center gap-3 border ${message ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                    {message ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-bold uppercase tracking-wider">{message || error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                            <img 
                                key={refreshKey}
                                src={previewUrl || (user?.photo ? `${user.photo}?t=${refreshKey}` : `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`)}
                                className="w-full h-full rounded-md object-cover border-2 border-brand-primary/20 shadow-xl" alt="" 
                            />
                            <div 
                                onClick={handlePhotoClick}
                                className="absolute -bottom-2 -right-2 p-2 bg-brand-primary rounded-md text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                            >
                                <Camera size={14} />
                            </div>
                        </div>
                        <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-white">{user?.firstName} {user?.lastName}</h2>
                        <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full inline-block">
                            Verified Guardian
                        </div>
                    </div>

                    <div className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-6 space-y-4">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-8 h-8 rounded-md bg-slate-800/50 flex items-center justify-center text-brand-primary"><Mail size={14} /></div>
                            <div className="text-xs truncate">{user?.email}</div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-8 h-8 rounded-md bg-slate-800/50 flex items-center justify-center text-brand-primary"><Phone size={14} /></div>
                            <div className="text-xs">{user?.phoneNumber || 'Not provided'}</div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-8 h-8 rounded-md bg-slate-800/50 flex items-center justify-center text-brand-primary"><MapPin size={14} /></div>
                            <div className="text-xs truncate">{user?.address || 'Mumbai, Maharashtra'}</div>
                        </div>
                    </div>
                </div>

                {/* Edit Section */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/50">
                            <User size={20} className="text-brand-primary" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-white font-outfit">Identity Delta</h3>
                        </div>
                        <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">First Name</label>
                                    <input {...profileFormik.getFieldProps('firstName')} className={ic} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">Last Name</label>
                                    <input {...profileFormik.getFieldProps('lastName')} className={ic} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">Contact Coordinates</label>
                                <input {...profileFormik.getFieldProps('phoneNumber')} placeholder="e.g. +91 9876543210" className={ic} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">Residential Vector (Address)</label>
                                <textarea {...profileFormik.getFieldProps('address')} rows={3} className={ic} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-brand-primary hover:bg-parent-primary disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest transition-all rounded-md shadow-xl shadow-brand-primary/20">
                                {loading ? 'Synchronizing...' : 'Save Synchronization'}
                            </button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/50">
                            <Lock size={20} className="text-indigo-400" />
                            <h3 className="text-lg font-black uppercase tracking-tight text-white font-outfit">Security Protocol</h3>
                        </div>
                        <form onSubmit={passFormik.handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">Legacy Password</label>
                                <input type="password" {...passFormik.getFieldProps('oldPassword')} className={ic} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">New Key Strength</label>
                                    <input type="password" {...passFormik.getFieldProps('newPassword')} className={ic} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-outfit">Verify New Key</label>
                                    <input type="password" {...passFormik.getFieldProps('confirmPassword')} className={ic} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest transition-all rounded-md">
                                {loading ? 'Updating Credentials...' : 'Overwrite Security Node'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ParentProfile;
