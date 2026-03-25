import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markRead, markAllRead } from '../../redux/slice/notification.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Trash2, Clock, Inbox, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkRead = (id) => {
        dispatch(markRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllRead());
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'Exam': return 'bg-student-primary/10 text-student-primary border-student-primary/20';
            case 'Assignment': return 'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/20';
            case 'Fee': return 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Pulse Feed</h1>
                    <p className="text-slate-500 font-medium text-lg italic mt-2">Real-time terminal telemetry and alerts.</p>
                </div>
                
                <button 
                    onClick={handleMarkAllRead}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/50 flex items-center gap-3"
                >
                    Clear All Interrupts <CheckCircle size={14} />
                </button>
            </header>

            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {items.length > 0 ? (
                        items.map((notification, idx) => (
                            <motion.div 
                                key={notification._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-[#0f0f12] border ${notification.isRead ? 'border-slate-800/40 opacity-60' : 'border-luxury-emerald/30 border-l-4 border-l-luxury-emerald shadow-[0_0_30px_rgba(16,185,129,0.05)]'} p-8 rounded-md group hover:bg-slate-800/20 transition-all cursor-pointer`}
                                onClick={() => !notification.isRead && handleMarkRead(notification._id)}
                            >
                                <div className="flex gap-6">
                                    <div className={`p-4 rounded-md border shrink-0 h-fit ${getTypeStyles(notification.type)}`}>
                                        <Bell size={24} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getTypeStyles(notification.type)}`}>
                                                {notification.type || 'System Alert'}
                                            </span>
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold italic">
                                                <Clock size={12} />
                                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight font-outfit mb-2">{notification.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed italic line-clamp-2">{notification.message}</p>
                                        
                                        {notification.link && (
                                            <div className="mt-4 pt-4 border-t border-slate-800/50">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-emerald group-hover:underline">Engage Protocol →</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-3 text-slate-600 hover:text-luxury-rose transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-40 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed">
                            <Inbox size={64} className="text-slate-800 mx-auto mb-8 opacity-20" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2">Static Silence</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">No terminal interrupts detected in history.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Notifications;
