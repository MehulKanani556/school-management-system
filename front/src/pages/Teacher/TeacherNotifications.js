import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markRead, markAllRead, deleteNotification } from '../../redux/slice/notification.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Trash2, Calendar, Activity, CheckCircle2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherNotifications = () => {
    const dispatch = useDispatch();
    const { notifications, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkAsRead = async (id) => {
        try {
            await dispatch(markRead(id)).unwrap();
            toast.success('Alert verified');
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteNotification(id)).unwrap();
            toast.success('Alert purged');
        } catch (error) {
            toast.error('Purge failed');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await dispatch(markAllRead()).unwrap();
            toast.success('All alerts verified');
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-slate-900/40 p-10 rounded-md border border-slate-800/60 shadow-2xl backdrop-blur-3xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-teacher-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-teacher-primary uppercase tracking-[0.45em] italic">System Alerts</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Notifications</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic leading-relaxed">Direct institutional signals.</p>
                </div>
                
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="h-14 bg-teacher-primary hover:bg-teacher-primary/80 text-white px-8 rounded-md font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-3 italic"
                    >
                        <CheckSquare size={18} /> Verify All
                    </button>
                )}
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-8 animate-pulse text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Retrieving Alerts...</h3>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notification, idx) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-start md:items-center justify-between gap-6 p-6 rounded-md border transition-all ${
                                    notification.isRead 
                                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60' 
                                        : 'bg-brand-surface border-teacher-primary/30 shadow-lg'
                                }`}
                            >
                                <div className="flex items-start gap-6 flex-1">
                                    <div className={`p-4 rounded-md flex-shrink-0 ${notification.isRead ? 'bg-slate-800/50 text-slate-500' : 'bg-teacher-primary/10 text-teacher-primary'}`}>
                                        <Bell size={24} className={!notification.isRead ? 'animate-pulse' : ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className={`text-lg font-black italic tracking-tight uppercase ${notification.isRead ? 'text-slate-400' : 'text-white'}`}>{notification.title}</h3>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">{notification.message}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 italic mt-2">
                                            <Calendar size={12} /> {new Date(notification.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-3 bg-teacher-primary/10 hover:bg-teacher-primary text-teacher-primary hover:text-white rounded-md transition-all shadow-xl"
                                            title="Mark as Read"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(notification._id)}
                                        className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md transition-all shadow-xl"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="py-20 text-center opacity-30 italic">
                        <CheckCircle className="w-16 h-16 mx-auto mb-8 text-slate-500" />
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Zero Active Alerts</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherNotifications;
