import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { downloadReportCard } from '../../redux/slice/parent.slice';
import { motion } from 'framer-motion';
import { User, GraduationCap, Calendar, MapPin, Phone, Mail, FileText, Download, Award } from 'lucide-react';

const ChildProfile = () => {
    const dispatch = useDispatch();
    const { selectedChild } = useSelector(state => state.parent);

    if (!selectedChild) return (
        <div className="flex items-center justify-center h-64 text-slate-500 italic">
            Select a child to view their complete academic profile
        </div>
    );

    const info = [
        { icon: <User size={16} />, label: 'Admission Number', value: selectedChild.admissionNumber || 'PENDING' },
        { icon: <GraduationCap size={16} />, label: 'Standard/Grade', value: `Grade ${selectedChild.standard?.level || 'N/A'}` },
        { icon: <Award size={16} />, label: 'Class Section', value: `Section ${selectedChild.classSection?.sectionLabel || 'N/A'}` },
        { icon: <Calendar size={16} />, label: 'Date of Birth', value: selectedChild.dateOfBirth ? new Date(selectedChild.dateOfBirth).toLocaleDateString('en-GB') : 'N/A' },
        { icon: <MapPin size={16} />, label: 'Residential Vector', value: selectedChild.address || 'Sanitizing...' },
        { icon: <Phone size={16} />, label: 'Guardian Contact', value: selectedChild.guardianContact || 'N/A' },
        { icon: <Mail size={16} />, label: 'Guardian Correspondence', value: selectedChild.guardianEmail || 'N/A' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="relative group bg-brand-surface/40 border border-brand-border/40 rounded-md p-10 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-40 h-40">
                    <img src={selectedChild.photo || `https://ui-avatars.com/api/?name=${selectedChild.firstName}+${selectedChild.lastName}&background=random`}
                        className="w-full h-full rounded-md object-cover border-4 border-slate-800 shadow-2xl ring-2 ring-brand-primary/20" alt="" />
                    <div className="absolute -bottom-2 -right-2 p-2.5 bg-brand-primary rounded-md text-white shadow-xl">
                        <GraduationCap size={18} />
                    </div>
                </motion.div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-white">
                            {selectedChild.firstName} <span className="text-brand-primary">{selectedChild.lastName}</span>
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-1 uppercase tracking-widest text-xs">Official Student Identity Node</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button onClick={() => dispatch(downloadReportCard({ studentId: selectedChild._id, name: `${selectedChild.firstName}_${selectedChild.lastName}` }))}
                            className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md font-black text-xs uppercase tracking-widest transition-all text-indigo-400 flex items-center gap-3">
                            <FileText size={16} /> Download Report Card
                        </button>
                        <div className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-md font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-3">
                            <Download size={16} /> Academic Archive
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                        <User size={20} className="text-brand-primary" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-white font-outfit">Student Telemetry</h3>
                    </div>

                    <div className="space-y-6">
                        {info.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-slate-800/50 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-200">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-brand-surface/40 border border-brand-border/40 rounded-md p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                        <MapPin size={20} className="text-indigo-400" />
                        <h3 className="text-lg font-black uppercase tracking-tight text-white font-outfit">Guardian Integration</h3>
                    </div>

                    <div className="space-y-6">
                        {info.slice(4).map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-slate-800/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-200 text-right max-w-[200px] truncate">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChildProfile;
