import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, ClipboardList,
    Upload, MessageSquare, LogOut, ChevronRight, ChevronDown,
    Bell, User, Activity, Calendar as CalendarIcon, Calendar, Clock, CalendarDays, TrendingUp, DollarSign, Layout,
    Megaphone, Shield, Trophy, Menu, HardDrive, Database, Brain
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

    const [expanded, setExpanded] = useState(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const navItems = [
        { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', end: true },
        {
            label: 'Academic Records',
            icon: BookOpen,
            children: [
                { to: '/teacher/classes', icon: Layout, label: 'My Classes' },
                { to: '/teacher/lesson-plans', icon: ClipboardList, label: 'Lesson Planning' },
                { to: '/teacher/attendance', icon: CalendarIcon, label: 'Attendance' },
                { to: '/teacher/bulk-attendance', icon: Upload, label: 'Bulk Attendance' },
                { to: '/teacher/marks', icon: Activity, label: 'Examination Marks' },
                { to: '/teacher/exam-schedule', icon: Trophy, label: 'Exam Schedule' },
                { to: '/teacher/assignments', icon: Upload, label: 'Assignments' },
                { to: '/teacher/quizzes', icon: Brain, label: 'Student Quizzes' },
                { to: '/teacher/timetable', icon: Clock, label: 'My Timetable' },
                { to: '/teacher/question-bank', icon: Database, label: 'Question Bank' },
            ]
        },
        {
            label: 'Communication Hub',
            icon: MessageSquare,
            children: [
                { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements' },
                { to: '/teacher/messages?tab=chat', icon: Shield, label: 'Chat & Messages' },
                { to: '/teacher/messages?tab=notices', icon: Layout, label: 'Notice Board' },
                { to: '/teacher/meetings', icon: Calendar, label: 'PTM Meetings' },
                { to: '/teacher/resources', icon: HardDrive, label: 'Resource Library' },
            ]
        },
        {
            label: 'Staff Management',
            icon: Clock,
            children: [
                { to: '/teacher/payroll', icon: DollarSign, label: 'Salary/Payroll' },
                { to: '/teacher/leaves', icon: CalendarDays, label: 'Leave Requests' },
                { to: '/teacher/performance-report', icon: TrendingUp, label: 'My Performance' },
            ]
        },
        {
            label: 'Profile Settings',
            icon: User,
            children: [
                { to: '/teacher/profile', icon: User, label: 'My Profile' },
                { to: '/teacher/unified-calendar', icon: CalendarIcon, label: 'Calendar' },
                { to: '/teacher/holidays', icon: Calendar, label: 'Holidays' },
            ]
        }
    ];

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;
        socket.on('NEW_NOTIFICATION', (notif) => {
            dispatch(receiveNotification(notif));
            toast.success(`Teacher Intel: ${notif.title}`, {
                icon: '👨‍🏫',
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #8b5cf6',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '11px'
                }
            });
        });
        return () => socket.off('NEW_NOTIFICATION');
    }, [socket, dispatch]);

    useEffect(() => {
        const activeParent = navItems.find(item =>
            item.children?.some(child => location.pathname === child.to)
        );
        if (activeParent) setExpanded(activeParent.label);
    }, [location.pathname]);

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
        setExpanded(expanded === label ? null : label);
    };

    return (
        <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
            {/* Sidebar - Terminal Aesthetic with Teacher Theme */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
                <div className="p-8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-teacher-primary to-teacher-secondary flex items-center justify-center font-black text-xl italic shadow-lg">TC</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">Teacher <span className="text-teacher-primary">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Faculty Operations</p>
                    {navItems.map((item) => {
                        const hasChildren = !!item.children;
                        const isExpanded = expanded === item.label;
                        const Icon = item.icon;

                        if (!hasChildren) {
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-teacher-primary text-black shadow-lg shadow-teacher-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-teacher-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                                    {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                                </Link>
                            );
                        }

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleSubmenu(item.label)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Icon size={18} className={isExpanded ? 'text-teacher-primary' : 'group-hover:text-teacher-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-teacher-primary' : 'opacity-40'}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden bg-brand-background/30 rounded-md mx-2 border border-brand-border/40"
                                        >
                                            <div className="py-1 space-y-1">
                                                {item.children.map((child) => {
                                                    const ChildIcon = child.icon;
                                                    const childActive = isActive(child.to);
                                                    return (
                                                        <Link
                                                            key={child.to}
                                                            to={child.to}
                                                            onClick={() => setSidebarOpen(false)}
                                                            className={`flex items-center gap-4 px-8 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-teacher-primary bg-teacher-primary/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                                        >
                                                            <ChildIcon size={16} className={childActive ? 'text-teacher-primary' : 'group-hover:text-teacher-primary transition-colors'} />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-outfit">{child.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-6 flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-teacher-primary/10 hover:text-teacher-primary transition-all group font-outfit border border-transparent hover:border-teacher-primary/20 uppercase tracking-widest text-[11px] font-black">
                        <LogOut size={20} />
                        <span className="italic">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header - Stays at top */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border/60 z-10 w-full transition-all">
                    <div className="flex items-center gap-4 text-slate-500">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors">
                            <Menu size={20} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border hidden sm:block leading-none italic shadow-inner">Institutional Node</span>
                        <ChevronRight size={14} className="hidden sm:block opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teacher-primary italic">Teacher Center Terminal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-teacher-primary text-white border-teacher-primary shadow-xl scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-teacher-primary hover:border-teacher-primary/40 shadow-inner'}`}
                            >
                                <Bell size={18} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teacher-primary rounded-md border-2 border-brand-surface animate-pulse"></span>
                            </button>
                            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Teacher" />
                        </div>

                        <div className="h-10 w-px bg-brand-border/60"></div>

                        <div className="flex items-center gap-4 relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-[9px] font-black text-teacher-primary uppercase tracking-[0.4em] opacity-80 leading-none italic">ID: 00{user?._id.toString().slice(-3)}</p>
                                </div>
                                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-teacher-primary transition-all p-0.5">
                                    <div className="w-full h-full rounded-md overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center">
                                        {user?.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-slate-600" />}
                                    </div>
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
                                            className="absolute right-0 top-[calc(100%+12px)] z-20 w-64 p-3 rounded-md bg-brand-surface border border-brand-border shadow-3xl backdrop-blur-2xl"
                                        >
                                            <div className="px-5 py-4 border-b border-brand-border mb-2 text-center">
                                                <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit italic">
                                                    {user?.firstName} {user?.lastName}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{user?.email}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <button
                                                    onClick={handleSettings}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic">
                                                    <User size={18} className="text-teacher-primary" />
                                                    View Profile
                                                </button>

                                                <div className="p-1 mb-1">
                                                    <div className="h-px bg-brand-border w-full" />
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-teacher-primary/10 text-teacher-primary transition-all text-[10px] font-black uppercase tracking-widest group italic"
                                                >
                                                    <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
                                                    Log Out Matrix
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
