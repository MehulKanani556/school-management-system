import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, CreditCard, DollarSign, FileText,
  MessageSquare, Menu, Clock, Calendar, Bell,
  LogOut, ChevronDown, ChevronRight, User, GraduationCap, Users,
  Globe, CalendarDays, Wallet, Receipt,
  BookOpen,
  PieChart,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';
import { logout } from '../../redux/slice/auth.slice';
import AcademicYearSwitcher from '../../components/AcademicYearSwitcher';

const AccountantLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/accountant' },
    {
      label: 'Fee & Accounts',
      icon: DollarSign,
      children: [
        { path: '/accountant/fees', icon: Receipt, label: 'Collect Fees' },
        { path: '/accountant/students', icon: Users, label: 'Student List' },
        { path: '/accountant/fee-structures', icon: BookOpen, label: 'Fee Structures' },
        { path: '/accountant/payroll', icon: Wallet, label: 'Staff Payroll' },
      ]
    },
    {
      label: 'Reports & Audit',
      icon: Shield,
      children: [
        { path: '/accountant/reports', icon: PieChart, label: 'Financial Reports' },
        { path: '/accountant/audit-logs', icon: Shield, label: 'Security Audit' },
        { path: '/accountant/holidays', icon: Calendar, label: 'Holiday List' },
      ]
    },
    {
      label: 'Communication',
      icon: MessageSquare,
      children: [
        { path: '/accountant/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/accountant/announcements', icon: Bell, label: 'Announcements' },
        { path: '/accountant/notifications', icon: Bell, label: 'Notifications' },
      ]
    },
    {
      label: 'Profile Settings',
      icon: User,
      children: [
        { path: '/accountant/profile', icon: User, label: 'My Profile' },
        { path: '/accountant/attendance', icon: Clock, label: 'My Presence' },
        { path: '/accountant/leaves', icon: Calendar, label: 'My Leaves' },
      ]
    }
  ];

  const { unreadCount: notifCount } = useSelector((state) => state.notifications);
  const { socket } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_NOTIFICATION', (notif) => {
      dispatch(receiveNotification(notif));
      toast.success(`Notification: ${notif.title}`, {
        icon: '💰',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #f59e0b',
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
      item.children?.some(child => location.pathname === child.path)
    );
    if (activeParent) setExpandedMenu(activeParent.label);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate(`/accountant/profile`);
    setShowProfileMenu(false);
  };

  const toggleSubmenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (path) => {
    if (path === '/accountant') return location.pathname === '/accountant';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Terminal Aesthetic with Accountant Theme */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full shadow-2xl shadow-accountant-primary/5`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-accountant-primary to-accountant-secondary flex items-center justify-center font-black text-xl italic shadow-lg shadow-accountant-primary/20 text-black">AC</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">School <span className="text-accountant-primary">Accounts</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbarThin text-white">
          <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Accounting</p>
          {navItems.map((item) => {
            const hasChildren = !!item.children;
            const isExpanded = expandedMenu === item.label;

            if (!hasChildren) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.path) ? 'bg-accountant-primary text-black shadow-lg shadow-accountant-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <item.icon size={18} className={isActive(item.path) ? 'text-black' : 'group-hover:text-accountant-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
                  {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <item.icon size={18} className={isExpanded ? 'text-accountant-primary' : 'group-hover:text-accountant-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit text-left flex-1">{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accountant-primary' : 'opacity-40'}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-brand-background/50 rounded-md mx-2 border border-brand-border/40"
                    >
                      <div className="py-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-4 px-8 py-3 rounded-md transition-all duration-300 group ${isActive(child.path) ? 'text-accountant-primary bg-accountant-primary/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                          >
                            <child.icon size={16} className={isActive(child.path) ? 'text-accountant-primary' : 'group-hover:text-accountant-primary transition-colors'} />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] font-outfit">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-6 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-accountant-primary/10 hover:text-accountant-primary transition-all group font-outfit border border-transparent hover:border-accountant-primary/20 uppercase tracking-widest text-[11px] font-black">
            <LogOut size={20} />
            <span className="italic">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border/60 z-10 w-full transition-all">
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-white/5 transition-colors">
              <Menu size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-brand-background px-4 py-2 rounded-md border border-brand-border/60 hidden sm:block leading-none italic shadow-inner">Accounting Portal</span>
            <ChevronRight size={14} className="hidden sm:block opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accountant-primary italic">Fee & Payroll Management</span>
          </div>

          <div className="flex items-center gap-6">
            <AcademicYearSwitcher />
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-accountant-primary text-black border-accountant-primary shadow-xl shadow-accountant-primary/20 scale-110' : 'bg-brand-background border-brand-border/60 text-slate-400 hover:text-accountant-primary hover:border-accountant-primary/40 shadow-inner'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accountant-primary rounded-md border-2 border-brand-surface animate-pulse"></span>
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Accountant" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-accountant-primary uppercase tracking-[0.4em] opacity-80 leading-none italic">ID: 00{user?._id.toString().slice(-3)}</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border/60 overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-accountant-primary transition-all p-0.5">
                  <div className="w-full h-full rounded-md overflow-hidden bg-brand-surface border border-brand-border/60 flex items-center justify-center">
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
                      <div className="px-5 py-4 border-b border-brand-border/60 mb-2 text-center">
                        <p className="text-sm font-black uppercase text-white tracking-widest leading-none mb-1 font-outfit italic">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{user?.email}</p>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={handleSettings}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic">
                          <User size={18} className="text-accountant-primary" />
                          Profile Settings
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border/60 w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accountant-primary/10 text-accountant-primary transition-all text-[10px] font-black uppercase tracking-widest group italic"
                        >
                          <LogOut size={18} className="group-hover:-rotate-6 transition-transform" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content scrolling here */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AccountantLayout;
