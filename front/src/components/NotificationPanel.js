import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, ExternalLink, Info, Award, Calendar, AlertCircle } from 'lucide-react';
import { markRead, markAllRead } from '../redux/slice/notification.slice';
import { Link } from 'react-router-dom';

const NotificationPanel = ({ isOpen, onClose, role }) => {
    const dispatch = useDispatch();
    const { items, unreadCount, loading } = useSelector((state) => state.notifications);

    const getFullViewLink = () => {
        if (role === 'SchoolAdmin') return '/school-admin/notifications';
        if (role === 'Parent') return '/parent/notifications';
        if (role === 'Student') return '/student/notifications';
        return '#';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Assignment': return <Info className="text-brand-primary" size={16} />;
            case 'Mark': return <Award className="text-brand-secondary" size={16} />;
            case 'Attendance': return <Calendar className="text-emerald-500" size={16} />;
            case 'Fee': return <AlertCircle className="text-luxury-rose" size={16} />;
            default: return <Bell className="text-slate-400" size={16} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-20 right-8 w-[420px] bg-brand-surface border border-brand-border rounded-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col max-h-[600px] backdrop-blur-2xl"
                    >
                        <header className="p-6 border-b border-brand-border/60 bg-brand-background/40 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter font-outfit">Institutional Alerts</h3>
                                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] opacity-80 mt-0.5">{unreadCount} Critical Unread Messages</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => dispatch(markAllRead())}
                                        className="p-2.5 rounded-md bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all border border-brand-primary/20 shadow-xl"
                                        title="Synchronize All"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                                <button onClick={onClose} className="p-2.5 rounded-md bg-brand-background text-slate-400 hover:text-white transition-all border border-brand-border shadow-xl">
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {items.length > 0 ? items.map((notif) => (
                                <motion.div
                                    key={notif._id}
                                    layoutId={notif._id}
                                    className={`p-5 rounded-md border transition-all cursor-pointer group relative overflow-hidden ${notif.isRead ? 'bg-brand-background/20 border-brand-border/40 opacity-70' : 'bg-brand-background/40 border-brand-primary/20 shadow-xl shadow-brand-primary/5 hover:border-brand-primary/40'}`}
                                    onClick={() => !notif.isRead && dispatch(markRead(notif._id))}
                                >
                                    {!notif.isRead && <div className="absolute top-0 right-0 w-12 h-12 bg-brand-primary/10 rounded-bl-[2rem] blur-xl pointer-events-none" />}

                                    <div className="flex gap-5 relative z-10">
                                        <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-lg border ${notif.isRead ? 'bg-brand-surface border-brand-border/50' : 'bg-brand-surface border-brand-primary/30'}`}>
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest truncate">{String(notif.title || '')}</h4>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">
                                                {typeof notif.message === 'object' ? JSON.stringify(notif.message) : String(notif.message || '')}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-brand-surface border border-brand-border/50 overflow-hidden flex items-center justify-center">
                                                        {notif.sender?.photo ? <img src={notif.sender.photo} alt="" className="w-full h-full object-cover" /> : <div className="text-[7px] font-bold">{notif.sender?.firstName?.charAt(0)}</div>}
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{notif.sender?.role || 'System'} Registry</span>
                                                </div>

                                                {notif.link && (
                                                    <Link
                                                        to={notif.link}
                                                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                                                        className="flex items-center gap-2 text-[9px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-all group/link"
                                                    >
                                                        Access Matrix <ExternalLink size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center opacity-30 gap-4">
                                    <Bell size={48} className="text-slate-600" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Alert Pipeline Empty</p>
                                </div>
                            )}
                        </div>

                        <footer className="p-4 border-t border-brand-border/60 bg-brand-background/40">
                            <Link 
                                to={getFullViewLink()}
                                onClick={onClose}
                                className="w-full flex items-center justify-center py-3 rounded-md bg-brand-surface text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-brand-background hover:text-white transition-all border border-brand-border shadow-xl active:scale-95"
                            >
                                View Full Intelligence Registry
                            </Link>
                        </footer>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
