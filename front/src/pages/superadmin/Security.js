import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, clearUserError } from '../../redux/slice/user.slice';
import { ShieldCheck, AlertTriangle, UserCheck, ShieldOff, Activity, MoreHorizontal, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Security = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const admins = users.filter(u => u.role === 'Super_Admin');
    const lockedUsers = users.filter(u => u.failedLoginAttempts > 0);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl xs:text-3xl font-bold tracking-tight text-slate-100 font-inter italic uppercase leading-tight">Security & Access Center</h1>
                    <p className="text-[11px] xs:text-sm font-medium text-slate-400 mt-1 tracking-wide flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-md bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                        Firewall Situational Monitoring Active.
                    </p>
                </div>
                <div className="px-5 py-3 rounded-md bg-brand-surface border border-brand-border flex items-center gap-4 shadow-2xl group cursor-default transition-all hover:border-brand-primary/40">
                    <div className="w-10 h-10 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none mb-1">Status</p>
                        <p className="text-sm font-black text-slate-200 tracking-tighter leading-none uppercase italic underline decoration-brand-primary/30 underline-offset-4">Synchronized</p>
                    </div>
                </div>
            </div>

            {/* Security Alerts / Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                    { label: 'Privileged Accounts', value: admins.length, icon: UserCheck, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', note: 'Global Admin Mapping' },
                    { label: 'Security Anomalies', value: lockedUsers.length, icon: AlertTriangle, color: 'text-luxury-rose bg-luxury-rose/10 border-luxury-rose/20', note: 'Credential Integrity Registry' },
                    { label: 'Active Sessions', value: users.filter(u => u.isActive).length, icon: Activity, color: 'text-luxury-emerald bg-luxury-emerald/10 border-luxury-emerald/20', note: 'Concurrent Flow Monitoring' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-brand-surface p-8 rounded-md border border-brand-border shadow-2xl group hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-md border ${stat.color} transition-all duration-500`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">Situational Telemetry</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-100 tracking-tighter leading-none mb-2 italic uppercase font-outfit">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-200 tracking-tight mb-1">{stat.label}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic leading-none">{stat.note}</p>
                    </div>
                ))}
            </div>

            {/* Privileged User Registry */}
            <div className="bg-brand-surface border border-brand-border rounded-md shadow-2xl overflow-hidden group">
                <div className="px-6 py-5 border-b border-brand-border bg-brand-background/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tight text-slate-100 leading-none">Infrastructure Administrator Clusters</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic mt-2 opacity-60">Mapping access protocols across management nodes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 px-4 rounded-md border border-brand-border bg-brand-background flex items-center gap-2 text-slate-400 hover:text-brand-primary transition-all cursor-pointer text-[10px] font-bold uppercase tracking-widest italic shadow-sm">
                            <User size={14} />
                            <span>Audit Registry</span>
                        </div>
                        <button className="p-2.5 bg-brand-background border border-brand-border rounded-md text-slate-400 hover:text-luxury-rose transition-all shadow-sm">
                            <ShieldOff size={18} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-brand-background/50 border-b border-brand-border">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Identity Identifier</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Node Role</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Integrity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right italic">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {admins.map((admin, i) => (
                                <tr key={i} className="group/row hover:bg-brand-background/40 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md border border-brand-border bg-brand-background overflow-hidden p-0.5 group-hover/row:border-brand-primary/30 transition-all shadow-sm">
                                                {admin.photo ? <img src={admin.photo} alt="" className="w-full h-full object-cover rounded-md" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={18} /></div>}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-200 tracking-tight group-hover/row:text-brand-primary transition-colors leading-none mb-1.5">{admin.firstName} {admin.lastName}</span>
                                                <span className="text-[10px] font-medium text-slate-500 opacity-60 lowercase italic">{admin.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-black uppercase text-brand-primary tracking-widest rounded-md italic">{admin.role.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-md ${admin.failedLoginAttempts > 0 ? 'bg-luxury-rose animate-pulse' : 'bg-luxury-emerald'}`}></div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest italic ${admin.failedLoginAttempts > 0 ? 'text-luxury-rose' : 'text-luxury-emerald'}`}>
                                                {admin.failedLoginAttempts > 0 ? `${admin.failedLoginAttempts} Faults` : 'Secure Cluster'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-slate-500 hover:text-brand-primary transition-all opacity-0 group-hover/row:opacity-100">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Security;
