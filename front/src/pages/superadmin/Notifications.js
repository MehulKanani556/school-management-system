import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, Search, Filter, Trash2, CheckCircle, Clock, Info, 
    AlertTriangle, Shield, Globe, Zap, ArrowUpRight, BookOpen, 
    Award, Calendar, CreditCard, Megaphone, FileText, DollarSign, 
    Truck, MessageSquare, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            toast.error('Failed to load notifications');
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
            toast.error('Failed to update notification');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            toast.error('Failed to update notifications');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Assignment': return BookOpen;
            case 'Mark': return Award;
            case 'Attendance': return Calendar;
            case 'Fee': return CreditCard;
            case 'Announcement': return Megaphone;
            case 'Leave': return FileText;
            case 'Payroll': return DollarSign;
            case 'Transport': return Truck;
            case 'Message': return MessageSquare;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'Assignment': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            case 'Mark': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Attendance': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Fee': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'Announcement': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            case 'Leave': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Payroll': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
            case 'Transport': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
            case 'Message': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
            default: return 'text-superadmin-primary bg-superadmin-primary/10 border-superadmin-primary/20';
        }
    };

    const filteredNotifications = useMemo(() => {
        if (filterCategory === 'All') return notifications;
        return notifications.filter(n => n.type === filterCategory);
    }, [notifications, filterCategory]);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 pb-4 font-outfit">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1 flex items-center gap-3">
                        <div className="relative">
                            <Bell className="text-superadmin-primary" size={24} />
                            {notifications.some(n => !n.isRead) && (
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-superadmin-primary rounded-md animate-ping"></div>
                            )}
                        </div>
                        System Notifications
                    </h1>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70">System alerts and school announcements.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={markAllRead}
                        disabled={notifications.every(n => n.isRead)}
                        className="h-10 px-4 bg-white/5 border border-white/10 text-white rounded-md flex items-center justify-center gap-2 hover:bg-white/[0.08] active:scale-95 transition-all group disabled:opacity-40 disabled:scale-100"
                    >
                        <CheckCircle size={12} className="text-slate-500 group-hover:text-superadmin-primary transition-colors" />
                        <span className="text-[9px] font-black uppercase italic tracking-widest text-slate-400 group-hover:text-white transition-colors">Acknowledge All</span>
                    </button>
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 h-10 px-4 rounded-md text-[9px] font-black uppercase tracking-widest text-white outline-none focus:border-superadmin-primary transition-all italic"
                    >
                        <option value="All">ALL ALERTS</option>
                        <option value="Message">MESSAGES</option>
                        <option value="Announcement">ANNOUNCEMENTS</option>
                        <option value="Fee">FEES & PAYMENTS</option>
                        <option value="Payroll">PAYROLL</option>
                        <option value="Attendance">ATTENDANCE</option>
                        <option value="General">GENERAL INFO</option>
                    </select>
                </div>
            </div>

            {/* High-tech Stats Deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-4 backdrop-blur-3xl relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-superadmin-primary/5 rounded-md blur-[40px] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-1000"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Total Platform Alerts</p>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter mt-0.5">{notifications.length}</h3>
                        </div>
                        <div className="p-2.5 bg-superadmin-primary/10 border border-superadmin-primary/20 rounded-md text-superadmin-primary shadow-lg shadow-superadmin-primary/5">
                            <Info size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-4 backdrop-blur-3xl relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-md blur-[40px] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-1000"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Pending Actions</p>
                            <h3 className="text-2xl font-black text-amber-500 italic tracking-tighter mt-0.5">{notifications.filter(n => !n.isRead).length}</h3>
                        </div>
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 shadow-lg shadow-amber-500/5">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/60 rounded-md p-4 backdrop-blur-3xl relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-md blur-[40px] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-1000"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Registry Sync Status</p>
                            <h3 className="text-xs font-black text-emerald-500 italic uppercase tracking-widest mt-2 leading-none flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-md bg-emerald-500 animate-pulse"></div>
                                Connected
                            </h3>
                        </div>
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-500 shadow-lg shadow-emerald-500/5">
                            <Zap size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-md backdrop-blur-3xl overflow-hidden shadow-2xl divide-y divide-white/5">
                {loading ? (
                    <div className="p-16 text-center opacity-30 animate-pulse">
                        <p className="text-[10px] font-black uppercase italic text-slate-600">Retrieving system alerts...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <AnimatePresence>
                        {filteredNotifications.map((n, i) => {
                            const Icon = getIcon(n.type);
                            return (
                                <motion.div 
                                    key={n._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-4 flex items-start gap-4 group hover:bg-white/[0.02] hover:translate-x-1 transition-all duration-300 ${!n.isRead ? 'border-l-2 border-superadmin-primary bg-superadmin-primary/[0.01]' : 'border-l border-transparent'}`}
                                >
                                    <div className={`p-2.5 rounded-md border shrink-0 group-hover:scale-110 transition-all duration-300 ${getColor(n.type)} shadow-lg shadow-black/20`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-3 mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className={`text-xs font-black italic uppercase tracking-tight truncate transition-colors ${!n.isRead ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{n.title}</h3>
                                                {!n.isRead && (
                                                    <span className="shrink-0 text-[6px] font-black uppercase tracking-widest text-superadmin-primary bg-superadmin-primary/10 border border-superadmin-primary/20 px-1.5 py-0.5 rounded animate-pulse">NEW</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{moment(n.createdAt).fromNow()}</span>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                    {!n.isRead && (
                                                        <button 
                                                            onClick={() => markAsRead(n._id)} 
                                                            title="Mark as read"
                                                            className="p-1.5 rounded-md hover:bg-superadmin-primary/10 text-slate-500 hover:text-superadmin-primary transition-all"
                                                        >
                                                            <CheckCircle size={12} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => deleteNotification(n._id)} 
                                                        title="Delete alert"
                                                        className="p-1.5 rounded-md hover:bg-superadmin-primary/10 text-slate-500 hover:text-superadmin-primary transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-[11px] font-bold italic transition-colors leading-relaxed line-clamp-1 ${!n.isRead ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'}`}>{n.message}</p>
                                        <div className="mt-3 flex items-center gap-4 justify-between">
                                            <div className="flex items-center gap-1 bg-slate-950/40 border border-white/5 px-2 py-0.5 rounded-md text-[7px] font-black text-slate-600 uppercase tracking-widest italic">
                                                <Clock size={8} className="text-slate-700" />
                                                <span>{moment(n.createdAt).format('HH:mm:ss')}</span>
                                            </div>
                                            {n.link && (
                                                <button 
                                                    onClick={() => navigate(n.link)}
                                                    className="flex items-center gap-1.5 group/link text-[8px] font-black text-superadmin-primary uppercase tracking-widest italic hover:underline transition-all cursor-pointer"
                                                >
                                                    <span>Resolve Action</span>
                                                    <ArrowRight size={8} className="group-hover/link:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <div className="p-24 text-center flex flex-col items-center justify-center grayscale group hover:grayscale-0 transition-opacity duration-1000">
                        <div className="relative mb-6">
                            <Bell size={64} className="text-slate-800 opacity-20 rotate-12" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        </div>
                        <h4 className="text-xl font-black uppercase italic tracking-widest text-slate-700">No Notifications</h4>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-4 max-w-xs mx-auto italic text-slate-700 leading-relaxed">No notifications found. Everything is working normally.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Notifications;
