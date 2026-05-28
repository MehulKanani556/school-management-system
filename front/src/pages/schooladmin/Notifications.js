import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, Trash2, Check, Info, Award, Calendar, AlertCircle, 
    ExternalLink, Search, Filter, RefreshCw, Trash, User,
    ChevronRight, ArrowRight
} from 'lucide-react';
import { fetchNotifications, markRead, markAllRead, deleteNotification } from '../../redux/slice/notification.slice';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Notifications = () => {
    const dispatch = useDispatch();
    const { items, loading, unreadCount } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Assignment': return <Info className="text-brand-primary" size={20} />;
            case 'Mark': return <Award className="text-brand-secondary" size={20} />;
            case 'Attendance': return <Calendar className="text-emerald-500" size={20} />;
            case 'Fee': return <AlertCircle className="text-luxury-rose" size={20} />;
            case 'Payroll': return <AlertCircle className="text-luxury-gold" size={20} />;
            default: return <Bell className="text-slate-400" size={20} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Assignment': return 'brand-primary';
            case 'Mark': return 'brand-secondary';
            case 'Attendance': return 'emerald-500';
            case 'Fee': return 'luxury-rose';
            case 'Payroll': return 'luxury-gold';
            default: return 'slate-400';
        }
    };

    const handleDelete = async (id) => {
        if (await window.confirm('Are you sure you want to delete this notification?')) {
            dispatch(deleteNotification(id));
            toast.success('Notification deleted');
        }
    };

    const handleMarkAll = () => {
        dispatch(markAllRead());
        toast.success('All notifications marked as read');
    };

    return (
        <div className="min-h-full flex flex-col gap-8 p-1 lg:p-4 text-slate-300 font-outfit selection:bg-brand-primary/30">
            {/* Header Section */}
            <div className="max-w-[1400px] w-full mx-auto shrink-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-brand-primary rounded-md"></div>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] italic leading-none">System Notifications</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
                            Notifications
                        </h1>
                        <p className="text-slate-500 font-bold text-[11px] lg:text-[12px] tracking-widest uppercase italic max-w-xl">
                            View and manage all system alerts, updates, and announcements in one place.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMarkAll}
                            disabled={unreadCount === 0}
                            className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary px-6 py-4 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all disabled:opacity-30 flex items-center gap-3 shadow-xl active:scale-95 group"
                        >
                            <Check size={16} className="group-hover:scale-125 transition-transform" />
                            Mark All As Read
                        </button>
                        <button 
                            onClick={() => dispatch(fetchNotifications())}
                            className="bg-slate-900 border border-slate-800 text-slate-400 p-4 rounded-md hover:text-white hover:border-slate-700 transition-all shadow-xl group"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter/Search Bar */}
            <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
                <div className="md:col-span-8 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-primary transition-colors duration-300" size={18} />
                    <input 
                        placeholder="Search notifications..."
                        className="w-full bg-slate-900/40 border-2 border-slate-800/40 h-16 pl-16 pr-6 rounded-md text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-brand-primary/50 transition-all placeholder:text-slate-700 italic shadow-inner backdrop-blur-3xl"
                    />
                </div>
                <div className="md:col-span-4 flex gap-4">
                    <button className="flex-1 bg-slate-900/40 border-2 border-slate-800/40 rounded-md flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all italic backdrop-blur-3xl group">
                        <div className="flex items-center gap-3">
                            <Filter size={16} />
                            Filter by Type
                        </div>
                        <ChevronRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Notifications Grid/List */}
            <div className="max-w-[1400px] w-full mx-auto flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
                <AnimatePresence mode="popLayout">
                    {items.length > 0 ? items.map((notif, idx) => (
                        <motion.div
                            key={notif._id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03, duration: 0.5 }}
                            className={`group relative overflow-hidden bg-slate-900/30 border border-slate-800/60 rounded-md p-3 lg:p-4 flex items-center justify-between gap-4 hover:border-brand-primary/40 transition-all backdrop-blur-3xl shadow-2xl ${!notif.isRead ? 'border-l-4 border-l-brand-primary shadow-brand-primary/5' : 'opacity-60 grayscale-[0.5]'}`}
                        >
                            {/* Visual Accent */}
                            {!notif.isRead && <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-1000 blur-2xl"></div>}

                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="shrink-0">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center border shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 ${!notif.isRead ? `bg-${getTypeColor(notif.type)}/10 border-${getTypeColor(notif.type)}/30` : 'bg-slate-800 border-slate-700'}`}>
                                        {React.cloneElement(getTypeIcon(notif.type), { size: 14 })}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border italic ${!notif.isRead ? `text-${getTypeColor(notif.type)} bg-${getTypeColor(notif.type)}/10 border-${getTypeColor(notif.type)}/20` : 'text-slate-600 bg-slate-950 border-slate-800'}`}>
                                            {notif.type || 'SYSTEM'}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">•</span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">•</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">By {notif.sender?.firstName || 'SYSTEM'} {notif.sender?.lastName || 'AUTO-RELAY'}</span>
                                    </div>
                                    <h3 className="text-xs lg:text-sm font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-brand-primary transition-colors">{String(notif.title)}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-none mt-1 line-clamp-1">
                                        {typeof notif.message === 'object' ? JSON.stringify(notif.message) : String(notif.message || '')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-4">
                                {notif.link && (
                                    <Link 
                                        to={notif.link}
                                        className="p-2 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-brand-primary/20 hover:border-brand-primary/30 transition-all active:scale-90"
                                        title="View Details"
                                    >
                                        <ExternalLink size={14} />
                                    </Link>
                                )}
                                {!notif.isRead && (
                                    <button 
                                        onClick={() => dispatch(markRead(notif._id))}
                                        className="p-2 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all active:scale-90"
                                        title="Mark as Read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(notif._id)}
                                    className="p-2 rounded-md bg-slate-950 border border-slate-800 text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                    title="Delete Notification"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-12 animate-pulse-slow">
                            <div className="relative">
                                <div className="w-40 h-40 rounded-md border-4 border-dashed border-slate-800 flex items-center justify-center group">
                                    <Bell size={64} className="text-slate-800 grayscale" />
                                </div>
                                <div className="absolute inset-0 w-40 h-40 border-b-4 border-brand-primary rounded-md animate-spin-slow"></div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-black text-slate-700 uppercase italic tracking-[0.2em]">No Notifications</h4>
                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] max-w-sm leading-relaxed mx-auto italic">All channels are currently clear. You have no new alerts.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;
