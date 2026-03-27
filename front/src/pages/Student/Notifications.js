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
            case 'Exam': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
            case 'Assignment': return 'bg-luxury-emerald/10 text-luxury-emerald border-luxury-emerald/20';
            case 'Fee': return 'bg-luxury-rose/10 text-luxury-rose border-luxury-rose/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl mx-auto font-outfit"
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-outfit">
                <div className="font-outfit">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Notifications</h1>
                    <p className="text-slate-500 font-medium text-lg italic mt-2 font-outfit">Stay updated with the latest school alerts and messages.</p>
                </div>
                
                <button 
                    onClick={handleMarkAllRead}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700/50 flex items-center gap-3 h-[48px] italic"
                >
                    Mark All Read <CheckCircle size={14} />
                </button>
            </header>

            <div className="space-y-4 font-outfit">
                <AnimatePresence mode='popLayout'>
                    {items.length > 0 ? (
                        items.map((notification, idx) => {
                            // Deep-clean legacy malformed data (case-insensitive)
                            let cleanTitle = notification.title || 'Institutional Alert';
                            let cleanMessage = notification.message || '';

                            // 1. Repair broken titles (case-insensitive handle for 'undefined' or 'null')
                            cleanTitle = cleanTitle.replace(/:\s*(undefined|null)/gi, ': Performance Results');

                            // 2. Repair broken messages containing raw Mongo IDs or '[object Object]'
                            // Detects 24-character hex strings (MongoDB IDs)
                            const idRegex = /[0-9a-fA-F]{24}/g;
                            cleanMessage = cleanMessage
                                .replace(/Grade secured for \[object Object\]/gi, 'Academic assessment finalized')
                                .replace(/Grade Secured For ([0-9a-fA-F]{24})/gi, (match, id) => `Grade secured for Assessment`);
                            
                            // 3. Fallback for mixed up casing or broken IDs in general
                            if (cleanMessage.match(idRegex)) {
                                cleanMessage = cleanMessage.replace(idRegex, 'Active Module');
                            }

                            return (
                                <motion.div 
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`bg-[#0f0f12]/60 border p-5 rounded-md group hover:bg-slate-800/20 transition-all cursor-pointer relative overflow-hidden flex gap-5 ${notification.isRead ? 'border-slate-800/40 opacity-80' : 'border-luxury-emerald/20 border-l-2 border-l-luxury-emerald shadow-2xl backdrop-blur-3xl'}`}
                                    onClick={() => !notification.isRead && handleMarkRead(notification._id)}
                                >
                                    <div className={`p-3 rounded-md border shrink-0 h-fit ${getTypeStyles(notification.type)}`}>
                                        <Bell size={18} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border italic ${getTypeStyles(notification.type)}`}>
                                                    {notification.type || 'Alert'}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="flex items-center gap-1.5 text-[8px] font-black text-luxury-emerald uppercase tracking-widest animate-pulse italic">
                                                        <div className="w-1 h-1 rounded-md bg-luxury-emerald"></div> New Update
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black italic uppercase tracking-widest">
                                                <Clock size={10} />
                                                <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-luxury-emerald transition-colors">{cleanTitle}</h3>
                                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed italic line-clamp-1">{cleanMessage}</p>
                                        
                                        {notification.link && (
                                            <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-luxury-emerald group-hover:tracking-[0.3em] transition-all flex items-center gap-2 italic">Follow Lifecycle →</span>
                                                {!notification.isRead && <div className="w-1.5 h-1.5 rounded-md bg-luxury-emerald"></div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center px-2">
                                        <button className="p-2 text-slate-700 hover:text-luxury-rose transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="py-40 text-center bg-[#0f0f12]/40 rounded-md border border-slate-800/50 border-dashed font-outfit">
                            <Inbox size={64} className="text-slate-800 mx-auto mb-8 opacity-20 font-outfit" />
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-[0.3em] font-outfit mb-2 italic">No Notifications</h3>
                            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest italic font-outfit">Your notification inbox is currently empty.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Notifications;
