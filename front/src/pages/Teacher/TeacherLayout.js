import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ClipboardList,
    Upload, MessageSquare, LogOut, ChevronRight, ChevronDown,
    Bell, User, Activity, Calendar as CalendarIcon, Calendar, Clock, CalendarDays, TrendingUp, DollarSign, Layout,
    Megaphone, Shield
} from 'lucide-react';
import { logout } from '../../redux/slice/auth.slice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetUnreadCount } from '../../redux/slice/communication.slice';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';

const TeacherLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.communication);
    const { unreadCount: notifCount } = useSelector((state) => state.notifications);
    const { socket } = useSocket();
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);

    React.useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    React.useEffect(() => {
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

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
        {
            label: 'Academic Cluster',
            icon: BookOpen,
            children: [
                { path: '/teacher/classes', icon: BookOpen, label: 'Assigned Sectors' },
                { path: '/teacher/attendance', icon: ClipboardList, label: 'Mark Attendance' },
                { path: '/teacher/marks', icon: Activity, label: 'Entry Marks' },
                { path: '/teacher/assignments', icon: Upload, label: 'Homework Node' },
                { path: '/teacher/timetable', icon: Clock, label: 'Timetable' },
            ]
        },
        {
            label: 'Communicate',
            icon: MessageSquare,
            children: [
                { path: '/teacher/messages?tab=feed', icon: Megaphone, label: 'Announcements' },
                { path: '/teacher/messages?tab=chat', icon: Shield, label: 'Direct Probe' },
                { path: '/teacher/messages?tab=notices', icon: Layout, label: 'Notice Board' },
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

    const [expandedMenu, setExpandedMenu] = React.useState(null);

    const handleLogout = () => {
        dispatch(logout());
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

    React.useEffect(() => {
        const activeItem = menuItems.find(item =>
            item.children?.some(child => isActive(child.path))
        );
        if (activeItem) setExpandedMenu(activeItem.label);
    }, [location.pathname, location.search]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-inter antialiased">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 rounded-mdg-slate-900 border-r border-slate-800/60 sticky top-0 h-screen z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">SM</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit">Teacher <span className="text-brand-primary">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
                    {menuItems.map((item) => {
                        const hasChildren = !!item.children;
                        const isExpanded = expandedMenu === item.label;

                        if (!hasChildren) {
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
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

                                <motion.div
                                    initial={false}
                                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                                    className="overflow-hidden pl-6 space-y-1"
                                >
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.path}
                                            to={child.path}
                                            onClick={() => {
                                                if (item.label === 'Communication') dispatch(resetUnreadCount());
                                            }}
                                            className={`flex items-center gap-4 px-6 py-3 rounded-md transition-all duration-300 group ${isActive(child.path) ? 'text-brand-primary bg-brand-primary/5 font-bold' : 'text-slate-500 hover:text-slate-200'}`}
                                        >
                                            <child.icon size={16} className={isActive(child.path) ? 'text-brand-primary' : 'opacity-60 group-hover:opacity-100'} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-outfit">{child.label}</span>
                                            {child.label === 'Direct Probe' && unreadCount > 0 && (
                                                <div className="ml-auto h-4 w-4 flex items-center justify-center rounded-md bg-brand-primary text-[8px] font-black text-white shadow-lg animate-pulse">
                                                    {unreadCount}
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </motion.div>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group font-outfit">
                        <LogOut size={20} />
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-md border border-slate-700/50">Infrastructure Control</span>
                        <ChevronRight size={14} />
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

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">Faculty ID: 00{user?._id.toString().slice(-3)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700/50 overflow-hidden flex items-center justify-center">
                                {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
