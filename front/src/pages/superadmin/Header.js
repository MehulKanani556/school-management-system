import React, { useState, useEffect } from 'react';
import { LogOut, User, Bell, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const Header = ({ user, onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { unreadCount: notifCount } = useSelector((state) => state.notifications);
    const { socket } = useSocket();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (notif) => {
            dispatch(receiveNotification(notif));
            toast.success(`Root Alert: ${notif.title}`, {
                icon: '🔑',
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '11px'
                }
            });
        });
        return () => socket.off('new_notification');
    }, [socket, dispatch]);

    const handleSettings = () => {
        navigate('/superadmin/profile');
        setShowProfileMenu(false);
    };

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10 w-full transition-all">
            <div className="flex items-center gap-4 text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-md border border-slate-700/50 hidden sm:block leading-none">Global Infrastructure</span>
                <ChevronRight size={14} className="hidden sm:block" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Super User Node</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-brand-primary text-white border-brand-primary shadow-xl scale-110' : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-brand-primary'}`}
                    >
                        <Bell size={18} />
                        {notifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-md border-2 border-slate-900 animate-pulse"></span>}
                    </button>
                    <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                </div>

                <div className="h-10 w-px bg-slate-800/60"></div>

                <div className="flex items-center gap-4 relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80 leading-none italic">Root Administrator</p>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-brand-primary transition-all">
                            {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 top-[calc(100%+12px)] z-20 w-64 p-3 rounded-md bg-slate-900 border border-slate-800/60 shadow-2xl backdrop-blur-2xl"
                                >
                                    <div className="px-5 py-4 border-b border-white/5 mb-2 text-center">
                                        <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            onClick={handleSettings}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                                            <User size={18} className="text-brand-primary" />
                                            View Profile
                                        </button>

                                        <div className="p-1 mb-1">
                                            <div className="h-px bg-white/5 w-full" />
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all text-xs font-black uppercase tracking-widest group"
                                        >
                                            <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
                                            Log Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
