import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, BookOpen, Clock, Trash2 } from 'lucide-react';

const ParentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data.notifications || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
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
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) { console.error(err); }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Assignment': return <BookOpen className="text-indigo-400" size={18} />;
            case 'Message': return <MessageSquare className="text-emerald-400" size={18} />;
            case 'Exam': return <AlertTriangle className="text-amber-400" size={18} />;
            case 'Attendance': return <Clock className="text-brand-primary" size={18} />;
            default: return <Info className="text-slate-400" size={18} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Notification Center</h1>
                    <p className="text-slate-500 text-sm italic">Stay updated with child activities and school broadcasts</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md">
                    <Bell size={16} className="text-brand-primary" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{notifications.filter(n => !n.isRead).length} Unread</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800/20 rounded-md" />)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-slate-800/20 border border-slate-700/50 rounded-md border-dashed">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-6">
                        <Bell size={32} />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-widest font-outfit">Synchronized Silence</p>
                    <p className="text-slate-600 text-sm italic mt-1">No new notifications detected</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((n, i) => (
                            <motion.div
                                key={n._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group relative bg-brand-surface/40 hover:bg-brand-surface/60 border ${n.isRead ? 'border-brand-border/40' : 'border-brand-primary/40'} rounded-md p-6 flex items-start gap-6 transition-all`}
                            >
                                <div className={`mt-1 w-10 h-10 rounded-md flex items-center justify-center border ${n.isRead ? 'bg-slate-800/50 border-slate-700/50' : 'bg-brand-primary/10 border-brand-primary/20'}`}>
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-sm font-black uppercase tracking-wide font-outfit ${n.isRead ? 'text-slate-400' : 'text-white'}`}>
                                            {n.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-medium italic">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-300'}`}>
                                        {n.message}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.isRead && (
                                        <button onClick={() => markAsRead(n._id)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-all" title="Mark as Read">
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotification(n._id)} className="p-2 bg-red-500/10 hover:bg-red-600/20 text-red-400 rounded-md transition-all" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ParentNotifications;
