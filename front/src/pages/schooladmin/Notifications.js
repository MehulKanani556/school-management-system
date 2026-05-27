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
        if (await window.confirm('Purge this signal from archive?')) {
            dispatch(deleteNotification(id));
            toast.success('Notification purged from registry');
        }
    };

    const handleMarkAll = () => {
        dispatch(markAllRead());
        toast.success('All signals synchronized');
    };

    return (
        <div className="min-h-full flex flex-col gap-8 p-1 lg:p-4 text-slate-300 font-outfit selection:bg-brand-primary/30">
            {/* Header Section */}
            <div className="max-w-[1400px] w-full mx-auto shrink-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-brand-primary rounded-md"></div>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] italic leading-none">Institutional Intelligence Archive</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
                            ALERTS <span className="text-brand-primary">&</span> SIGNALS
                        </h1>
                        <p className="text-slate-500 font-bold text-[11px] lg:text-[12px] tracking-widest uppercase italic max-w-xl">
                            Real-time administrative relay and system event logs. 
                            Archive synchronization in progress.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMarkAll}
                            disabled={unreadCount === 0}
                            className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary px-6 py-4 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all disabled:opacity-30 flex items-center gap-3 shadow-xl active:scale-95 group"
                        >
                            <Check size={16} className="group-hover:scale-125 transition-transform" />
                            Synchronize All
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
                        placeholder="SCAN SIGNAL ARCHIVE..."
                        className="w-full bg-slate-900/40 border-2 border-slate-800/40 h-16 pl-16 pr-6 rounded-md text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-brand-primary/50 transition-all placeholder:text-slate-700 italic shadow-inner backdrop-blur-3xl"
                    />
                </div>
                <div className="md:col-span-4 flex gap-4">
                    <button className="flex-1 bg-slate-900/40 border-2 border-slate-800/40 rounded-md flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all italic backdrop-blur-3xl group">
                        <div className="flex items-center gap-3">
                            <Filter size={16} />
                            Filter: Priority
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
                            className={`group relative overflow-hidden bg-slate-900/30 border border-slate-800/60 rounded-md p-6 lg:p-8 flex flex-col md:flex-row gap-8 hover:border-brand-primary/40 transition-all backdrop-blur-3xl shadow-2xl ${!notif.isRead ? 'border-l-4 border-l-brand-primary shadow-brand-primary/5' : 'opacity-60 grayscale-[0.5]'}`}
                        >
                            {/* Visual Accent */}
                            {!notif.isRead && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-1000 blur-2xl"></div>}

                            <div className="shrink-0">
                                <div className={`w-16 h-16 rounded-md flex items-center justify-center border-2 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3 ${!notif.isRead ? `bg-${getTypeColor(notif.type)}/10 border-${getTypeColor(notif.type)}/30` : 'bg-slate-800 border-slate-700'}`}>
                                    {getTypeIcon(notif.type)}
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border italic shadow-inner ${!notif.isRead ? `text-${getTypeColor(notif.type)} bg-${getTypeColor(notif.type)}/10 border-${getTypeColor(notif.type)}/20` : 'text-slate-600 bg-slate-950 border-slate-800'}`}>
                                                {notif.type || 'SYSTEM'} EVENT
                                            </span>
                                            <div className="h-1.5 w-1.5 rounded-md bg-slate-800"></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-none mt-2 group-hover:text-brand-primary transition-colors">{String(notif.title)}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!notif.isRead && (
                                            <button 
                                                onClick={() => dispatch(markRead(notif._id))}
                                                className="p-3 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-lg active:scale-90"
                                                title="Acknowledge Signal"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(notif._id)}
                                            className="p-3 rounded-md bg-slate-950 border border-slate-800 text-slate-600 hover:text-schooladmin-primary hover:border-schooladmin-primary/30 transition-all opacity-0 group-hover:opacity-100 shadow-xl active:scale-90"
                                            title="Purge Event"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm lg:text-base text-slate-400 font-bold leading-relaxed max-w-4xl border-l-2 border-slate-800/80 pl-6 italic uppercase tracking-tighter opacity-90">
                                    {typeof notif.message === 'object' ? JSON.stringify(notif.message) : String(notif.message || '')}
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/[0.03]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-md bg-slate-950 border border-white/5 overflow-hidden flex items-center justify-center p-0.5">
                                            {notif.sender?.photo ? <img src={notif.sender.photo} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-slate-700" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] leading-none mb-1 italic">RELAY ORIGIN</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none italic">{notif.sender?.firstName || 'SYSTEM'} {notif.sender?.lastName || 'AUTO-RELAY'}</span>
                                        </div>
                                    </div>

                                    {notif.link && (
                                        <Link 
                                            to={notif.link}
                                            className="flex items-center gap-3 bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/40 px-6 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-all shadow-2xl active:scale-95 group/link"
                                        >
                                            INITIALIZE ACCESS <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
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
                                <h4 className="text-2xl font-black text-slate-700 uppercase italic tracking-[0.2em]">Archive Void Confirmed</h4>
                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em] max-w-sm leading-relaxed mx-auto italic">All institutional channels are currently clear. Institutional intelligence synchronized.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;
