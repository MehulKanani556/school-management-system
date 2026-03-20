import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile } from '../../redux/slice/student.slice';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, ShieldCheck, Hash, Calendar, Info, Mail } from 'lucide-react';

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { profile, loading } = useSelector((state) => state.student);

    useEffect(() => {
        dispatch(fetchStudentProfile());
    }, [dispatch]);

    if (loading && !profile) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-luxury-emerald/20 border-t-luxury-emerald rounded-md animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <header>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 font-outfit">Student Identity</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl italic">Institutional node verification & credentials.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-emerald/5 rounded-md blur-3xl -mr-10 -mt-10"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="w-32 h-32 mx-auto rounded-md bg-slate-800 p-1 relative mb-6">
                                {profile?.photo ? (
                                    <img src={profile.photo} alt="Avatar" className="w-full h-full object-cover rounded-md" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-md">
                                        <User size={48} className="text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-luxury-emerald p-2 rounded-md shadow-lg border-2 border-[#0f0f12]">
                                    <ShieldCheck size={16} className="text-white" />
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-outfit mb-1">{profile?.firstName} {profile?.lastName}</h2>
                            <p className="text-luxury-emerald text-xs font-black uppercase tracking-[0.3em] font-outfit italic mb-6">Student Sector-01</p>
                            
                            <div className="inline-flex items-center gap-2 bg-slate-800/40 px-4 py-2 rounded-md border border-slate-700/50">
                                <Hash size={14} className="text-slate-500" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">{profile?.admissionNumber || 'PENDING'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0f0f12] to-luxury-emerald/5 border border-slate-800/60 p-8 rounded-md">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2"> <Info size={14}/> Academic Sector</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-md border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grade Level</span>
                                <span className="text-sm font-black text-white italic">Grade {profile?.classSection?.gradeLevel || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-md border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section</span>
                                <span className="text-sm font-black text-white italic">{profile?.classSection?.sectionLabel || 'A'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-md border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Roll Number</span>
                                <span className="text-sm font-black text-white italic">#{profile?.rollNumber || '00'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-luxury-emerald mb-10 italic">Telemetry & Coordinates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Birth Cycle</label>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-slate-800/40 rounded-md"><Calendar size={20} className="text-brand-primary/70" /></div>
                                    <span className="font-bold text-lg">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Gender Identity</label>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-slate-800/40 rounded-md"><User size={20} className="text-luxury-emerald/70" /></div>
                                    <span className="font-bold text-lg uppercase tracking-widest">{profile?.gender || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Address</label>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-slate-800/40 rounded-md"><MapPin size={20} className="text-brand-secondary/70" /></div>
                                    <span className="font-medium text-slate-300 italic">{profile?.address || 'Restricted/No Address'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f0f12] border border-slate-800/60 p-10 rounded-md shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-md blur-3xl -mr-20 -mb-20"></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-brand-primary mb-10 italic">Guardian Protocol</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Authorized Guardian</label>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-slate-800/40 rounded-md"><ShieldCheck size={20} className="text-brand-primary/70" /></div>
                                    <span className="font-bold text-lg italic">{profile?.guardianName || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Secure Contact</label>
                                <div className="flex items-center gap-4 text-white">
                                    <div className="p-3 bg-slate-800/40 rounded-md"><Phone size={20} className="text-luxury-emerald/70" /></div>
                                    <span className="font-bold text-lg tracking-widest">{profile?.guardianContact || 'N/A'}</span>
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
