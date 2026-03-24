import React, { useEffect, useState } from 'react';
import { Bell, Search, Filter, Trash2, CheckCircle, Clock, Info, AlertTriangle, Shield, Globe, Zap, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            toast.error('FAILED TO FETCH SYSTEM ALERTS');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error('FAILED TO UPDATE ALERT STATUS');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('ALERT PURGED FROM REGISTRY');
        } catch (err) {
            toast.error('FAILED TO PURGE ALERT');
        }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('ALL SYSTEM ALERTS ACKNOWLEDGED');
        } catch (err) {
            toast.error('FAILED TO UPDATE SYSTEM STATUS');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Security': return Shield;
            case 'System': return Zap;
            case 'Analytics': return Globe;
            case 'User': return Info;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'Security': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'System': return 'text-superadmin-primary bg-superadmin-primary/10 border-superadmin-primary/20';
            default: return 'text-slate-400 bg-slate-800 border-white/5';
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-10 font-outfit">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 flex items-center gap-4">
                        <div className="relative">
                            <Bell className="text-superadmin-primary" size={32} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-md animate-ping"></div>
                        </div>
                        System Notifications
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">Platform-wide alert telemetry & institutional broadcast registry.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={markAllRead}
                        className="h-12 px-6 bg-white/5 border border-white/10 text-white rounded-md flex items-center justify-center gap-2 hover:bg-white/[0.08] active:scale-95 transition-all group"
                    >
                        <CheckCircle size={14} className="text-slate-500 group-hover:text-superadmin-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 group-hover:text-white transition-colors">Acknowledge All Telemetry</span>
                    </button>
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 h-12 px-6 rounded-md text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic"
                    >
                        <option value="All">ALL ALERTS</option>
                        <option value="Security">SECURITY</option>
                        <option value="System">SYSTEM</option>
                        <option value="Analytics">ANALYTICS</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl divide-y divide-white/5">
                {notifications.length > 0 ? (
                    <AnimatePresence>
                        {notifications.map((n, i) => {
                            const Icon = getIcon(n.category);
                            return (
                                <motion.div 
                                    key={n._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-6 flex items-start gap-6 group hover:bg-white/[0.02] transition-all duration-500 ${!n.isRead ? 'border-l-2 border-superadmin-primary' : ''}`}
                                >
                                    <div className={`p-3 rounded-md border shrink-0 group-hover:scale-110 transition-all duration-500 ${getColor(n.category)} shadow-lg shadow-black/20`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`text-sm font-black italic uppercase tracking-tight transition-colors ${!n.isRead ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{n.title}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{moment(n.createdAt).fromNow()}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                                    {!n.isRead && (
                                                        <button onClick={() => markAsRead(n._id)} className="p-2 rounded-md hover:bg-superadmin-primary/10 text-slate-500 hover:text-superadmin-primary transition-all"><CheckCircle size={14} /></button>
                                                    )}
                                                    <button onClick={() => deleteNotification(n._id)} className="p-2 rounded-md hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-xs font-medium italic transition-colors leading-relaxed line-clamp-2 ${!n.isRead ? 'text-slate-300' : 'text-slate-600 group-hover:text-slate-400'}`}>{n.message}</p>
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} className="text-slate-700" />
                                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{moment(n.createdAt).format('HH:mm:ss')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 group/link cursor-pointer">
                                                <span className="text-[8px] font-black text-superadmin-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Execute Node Deep-Scan</span>
                                                <ArrowUpRight size={10} className="text-superadmin-primary opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <div className="p-32 text-center flex flex-col items-center justify-center grayscale group hover:grayscale-0 transition-opacity duration-1000">
                        <div className="relative mb-8">
                            <Bell size={82} className="text-slate-800 opacity-20 rotate-12" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        </div>
                        <h4 className="text-2xl font-black uppercase italic tracking-widest text-slate-700">Telemetry Deadzone</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 max-w-xs mx-auto italic text-slate-700 leading-relaxed">No system alerts detected in current operational cycle. Platform situational awareness remains stabilized.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Notifications;
