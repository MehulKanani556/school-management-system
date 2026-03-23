import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ClipboardList,
    Upload, MessageSquare, LogOut, ChevronRight, ChevronDown,
    Bell, User, Activity, Calendar as CalendarIcon, Calendar, Clock, CalendarDays, TrendingUp, DollarSign, Layout,
    Megaphone, Shield, Trophy, Menu
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetUnreadCount } from '../../redux/slice/communication.slice';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';

const TeacherLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.communication);
    const { unreadCount: notifCount } = useSelector((state) => state.notifications);
    const { socket } = useSocket();

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
        {
            label: 'Academic Cluster',
            icon: BookOpen,
            children: [
                { path: '/teacher/classes', icon: BookOpen, label: 'Assigned Sectors' },
                { path: '/teacher/lesson-plans', icon: ClipboardList, label: 'Lesson Matrix' },
                { path: '/teacher/attendance', icon: ClipboardList, label: 'Mark Attendance' },
                { path: '/teacher/marks', icon: Activity, label: 'Entry Marks' },
                { path: '/teacher/exam-schedule', icon: Trophy, label: 'Exam Schedule' },
                { path: '/teacher/assignments', icon: Upload, label: 'Homework Node' },
                { path: '/teacher/timetable', icon: Clock, label: 'Timetable Matrix' },
            ]
        },
        {
            label: 'Communicate',
            icon: MessageSquare,
            children: [
                { path: '/teacher/messages?tab=feed', icon: Megaphone, label: 'Announcements' },
                { path: '/teacher/messages?tab=chat', icon: Shield, label: 'Direct Probe' },
                { path: '/teacher/messages?tab=notices', icon: Layout, label: 'Notice Board' },
                { path: '/teacher/meetings', icon: Calendar, label: 'PTM Protocols' },
            ]
        },
        {
            label: 'Management Matrix',
            icon: DollarSign,
            children: [
                { path: '/teacher/fee-status', icon: DollarSign, label: 'Financial Status' },
                { path: '/teacher/payroll', icon: Clock, label: 'My Payroll' },
                { path: '/teacher/leaves', icon: CalendarDays, label: 'My Leaves' },
            ]
        },
        {
            label: 'Performance Intel',
            icon: TrendingUp,
            children: [
                { path: '/teacher/performance-report', icon: TrendingUp, label: 'Analytics' },
                { path: '/teacher/behavior-log', icon: Shield, label: 'Conduct Registry' },
                { path: '/teacher/reviews', icon: MessageSquare, label: 'Staff Reviews' },
            ]
        },
        {
            label: 'Professional Map',
            icon: User,
            children: [
                { path: '/teacher/profile', icon: User, label: 'Matrix Profile' },
                { path: '/teacher/unified-calendar', icon: CalendarIcon, label: 'Professional Roadmap' },
                { path: '/teacher/holidays', icon: Calendar, label: 'Holiday Sync' },
            ]
        },
    ];

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (notif) => {
            dispatch(receiveNotification(notif));
            toast.success(`Matrix Alert: ${notif.title}`, {
                icon: '🔔',
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #1e293b',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '10px'
                }
            });
        });
        return () => socket.off('new_notification');
    }, [socket, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleSettings = () => {
        navigate('/teacher/profile');
        setShowProfileMenu(false);
    };

    const isActive = (path) => {
        if (!path) return false;
        if (path.includes('?')) {
            const [base, query] = path.split('?');
            return location.pathname === base && location.search === '?' + query;
        }
        return location.pathname === path;
    };

    const toggleSubmenu = (label) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    useEffect(() => {
        const activeItem = menuItems.find(item =>
            item.children?.some(child => isActive(child.path))
        );
        if (activeItem) setExpandedMenu(activeItem.label);
    }, [location.pathname, location.search]);

    return (
        <div className="h-screen bg-slate-900 text-slate-100 flex font-inter antialiased overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
                <div className="p-8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">SM</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit">Teacher <span className="text-brand-primary">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const hasChildren = !!item.children;
                        const isExpanded = expandedMenu === item.label;

                        if (!hasChildren) {
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}
                                >
                                    <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'group-hover:text-brand-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                                    {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                                </Link>
                            );
                        }

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleSubmenu(item.label)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'text-white bg-slate-800/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
                                >
                                    <item.icon size={18} className={isExpanded ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit text-left flex-1">{item.label}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : 'opacity-40'}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-6 space-y-1"
                                        >
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={() => {
                                                        setSidebarOpen(false);
                                                        if (item.label === 'Communication') dispatch(resetUnreadCount());
                                                    }}
                                                    className={`flex items-center gap-4 px-6 py-3 rounded-md transition-all duration-300 group ${isActive(child.path) ? 'text-brand-primary bg-brand-primary/5 font-bold' : 'text-slate-500 hover:text-slate-200'}`}
                                                >
                                                    <child.icon size={16} className={isActive(child.path) ? 'text-brand-primary' : 'opacity-60 group-hover:opacity-100'} />
                                                    <span className="font-black text-[10px] uppercase tracking-[0.1em] font-outfit">{child.label}</span>
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-6 flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header - Stays at top */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 z-10 w-full transition-all">
                    <div className="flex items-center gap-4 text-slate-500">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md hover:bg-slate-800 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-md border border-slate-700/50 hidden sm:block leading-none">Infrastructure Control</span>
                        <ChevronRight size={14} className="hidden sm:block" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Teacher Terminal</span>
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
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80 leading-none italic">Faculty ID: 00{user?._id.toString().slice(-3)}</p>
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
                                                    onClick={handleLogout}
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

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
};

export default TeacherLayout;
