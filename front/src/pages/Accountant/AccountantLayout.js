import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    LayoutDashboard, CreditCard, Banknote, ClipboardList,
  MessageSquare, Menu, BookMarked, Clock, Calendar, Bell, 
  LogOut, ChevronDown, ChevronRight, User, TrendingUp, BarChart3,
  PieChart, FileText, Wallet, Calculator,
  Shield,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';
import { logout } from '../../redux/slice/auth.slice';

const navItems = [
  { to: '/accountant', icon: LayoutDashboard, label: 'Fiscal Control', end: true },
  {
    label: 'Revenue Management',
    icon: Wallet,
    children: [
      { to: '/accountant/fees', icon: CreditCard, label: 'Fee Collection' },
      { to: '/accountant/invoices', icon: FileText, label: 'Invoice Ledger' },
    ]
  },
  {
    label: 'Expenditure',
    icon: Calculator,
    children: [
      { to: '/accountant/payroll', icon: Banknote, label: 'Staff Payroll' },
      { to: '/accountant/expenses', icon: TrendingUp, label: 'Expense Matrix' },
    ]
  },
  {
    label: 'Intelligence',
    icon: BarChart3,
    children: [
      { to: '/accountant/reports', icon: PieChart, label: 'Financial Analytics' },
    ]
  },
  { to: '/accountant/messages', icon: MessageSquare, label: 'Communications' },
];

const AccountantLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { unreadCount: notifCount } = useSelector((state) => state.notifications);
    const { socket } = useSocket();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (notif) => {
            dispatch(receiveNotification(notif));
            toast.success(`Finance Alert: ${notif.title}`, {
                icon: '💰',
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

    useEffect(() => {
        const activeParent = navItems.find(item =>
            item.children?.some(child => location.pathname === child.to)
        );
        if (activeParent) setExpanded(activeParent.label);
    }, [location.pathname]);
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/accountant' },
        { icon: DollarSign, label: 'Fee Collection', path: '/accountant/fees' },
        { icon: CreditCard, label: 'Payroll', path: '/accountant/payroll' },
        { icon: BookOpen, label: 'Fee Structures', path: '/accountant/fee-structures' },
        { icon: PieChart, label: 'Reports', path: '/accountant/reports' },
        { icon: Shield, label: 'Audit Logs', path: '/accountant/audit-logs' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleSettings = () => {
        navigate('/accountant/profile');
        setShowProfileMenu(false);
    };

    const toggleSubmenu = (label) => {
        setExpanded(expanded === label ? null : label);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen bg-slate-900 text-slate-100 flex font-inter antialiased overflow-hidden">
            {/* Sidebar - Financial Aesthetic */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
                <div className="p-8 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-xl italic shadow-lg">AC</div>
                        <span className="text-xl font-black tracking-tight uppercase font-outfit leading-none">Fiscal <span className="text-brand-primary">Node</span></span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                                    className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}
                                >
                                    <Icon size={18} className={isActive(item.to) ? 'text-white' : 'group-hover:text-brand-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1">{item.label}</span>
                                    {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                                </Link>
                            );
                        }

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleSubmenu(item.label)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'bg-slate-800/40 text-slate-100' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}
                                >
                                    <Icon size={18} className={isExpanded ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : 'opacity-40'}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden pl-4 space-y-1"
                                        >
                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon;
                                                const childActive = isActive(child.to);
                                                return (
                                                    <Link
                                                        key={child.to}
                                                        to={child.to}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        <ChildIcon size={16} className={`transition-opacity ${childActive ? 'opacity-100 text-brand-primary' : 'opacity-60 group-hover:opacity-100'}`} />
                                                        <span className="font-black text-[10px] uppercase tracking-[0.15em] font-outfit">{child.label}</span>
                                                    </Link>
                                                );
                                            })}
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
                        <span className="text-[12px] font-black uppercase tracking-[0.15em]">Shutdown</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header - Fixed to top */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/40 z-10 w-full transition-all">
                    <div className="flex items-center gap-4 text-slate-500">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-slate-800 transition-colors">
                            <Menu size={20} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-md border border-slate-700/50 hidden sm:block leading-none">Fiscal Intelligence</span>
                        <ChevronRight size={14} className="hidden sm:block" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Accountant Terminal</span>
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
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80 leading-none italic">Chief Fiscal Officer</p>
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

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
};

export default AccountantLayout;
