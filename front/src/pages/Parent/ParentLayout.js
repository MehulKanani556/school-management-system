import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, BookOpen, CalendarCheck, ClipboardList,
  MessageSquare, Menu, BookMarked, Clock, Calendar, Bell,
  LogOut, ChevronDown, ChevronRight, User, GraduationCap, Users,
  Globe, CalendarDays, CreditCard, Brain, Trophy, FileText,
  Shield, Megaphone, Sun, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { fetchMyChildren, setSelectedChild } from '../../redux/slice/parent.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/parent', icon: LayoutDashboard, label: 'Dashboard', end: true },
  {
    label: 'Ward Performance',
    icon: GraduationCap,
    children: [
      { to: '/parent/attendance', icon: CalendarCheck, label: 'Attendance' },
      { to: '/parent/results', icon: Trophy, label: 'Academics' },
      { to: '/parent/timetable', icon: Clock, label: 'Timetable' },
      { to: '/parent/exams', icon: Calendar, label: 'Exams' },
      { to: '/parent/assignments', icon: FileText, label: 'Assignments' },
    ]
  },
  {
    label: 'Conduct & Meetings',
    icon: Shield,
    children: [
      { to: '/parent/behavior', icon: Shield, label: 'Conduct Registry' },
      { to: '/parent/meetings', icon: Calendar, label: 'PTM Protocols' },
    ]
  },
  {
    label: 'Institutional Hub',
    icon: Globe,
    children: [
      { to: '/parent/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/parent/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/parent/notifications', icon: Bell, label: 'Notifications' },
      { to: '/parent/holidays', icon: Sun, label: 'Holidays' },
    ]
  },
  {
    label: 'Financials & Logistics',
    icon: CreditCard,
    children: [
      { to: '/parent/fees', icon: CreditCard, label: 'Financial Ledger' },
      { to: '/parent/transport', icon: Truck, label: 'Transport' },
    ]
  },
//   { to: '/parent/profile', icon: User, label: 'Profile' },
];

const ParentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { children, selectedChild } = useSelector((state) => state.parent);
  const { unreadCount: notifCount } = useSelector((state) => state.notifications);
  const { socket } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChildSwitcher, setShowChildSwitcher] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchMyChildren());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on('NEW_NOTIFICATION', (notif) => {
      dispatch(receiveNotification(notif));
      toast.success(`Guardian Intel: ${notif.title}`, {
        icon: '🛡️',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #f43f5e',
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
    navigate('/parent/profile');
    setShowProfileMenu(false);
  };

  const toggleSubmenu = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Node System with Parent Theme */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-parent-primary to-parent-secondary flex items-center justify-center font-black text-xl italic shadow-[0_0_20px_rgba(244,63,94,0.3)]">GD</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit leading-none text-white">Guardian <span className="text-parent-primary">Node</span></span>
          </div>
        </div>

        {/* Sidebar-Based Child Switcher / Ward Matrix Dropdown */}
        <div className="px-6 mb-10">
          <button
            onClick={() => setShowChildSwitcher(!showChildSwitcher)}
            className="w-full flex items-center justify-between p-3 rounded-md bg-parent-primary/5 border border-parent-primary/20 text-parent-primary hover:bg-parent-primary/10 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 flex-shrink-0 rounded bg-parent-primary flex items-center justify-center font-black text-[11px] text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-white/10">
                {selectedChild?.firstName[0] || 'W'}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 text-white truncate italic font-outfit">{selectedChild?.firstName || "Select Ward"}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none italic">
                  Grade {selectedChild?.standard?.level || "N/A"} - {selectedChild?.classSection?.sectionLabel || "..."}
                </p>
              </div>
            </div>
            <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-300 ${showChildSwitcher ? 'rotate-180 text-parent-primary' : 'text-slate-500'}`} />
          </button>

          <AnimatePresence>
            {showChildSwitcher && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-1 bg-slate-800/10 rounded-md border border-slate-700/30 p-1"
              >
                {children?.map(child => (
                  <button
                    key={child._id}
                    onClick={() => {
                      dispatch(setSelectedChild(child));
                      setShowChildSwitcher(false);
                      toast.success(`Matrix Synced: ${child.firstName}`, {
                        icon: '📡',
                        style: {
                          borderRadius: '1.5rem',
                          background: '#0b1120',
                          color: '#fff',
                          border: '1px solid #f43f5e',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontSize: '10px'
                        }
                      });
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded hover:bg-white/5 transition-all text-left group ${selectedChild?._id === child._id ? 'bg-parent-primary/10 border-l-2 border-parent-primary' : ''}`}
                  >
                    <div className={`w-8 h-8 flex-shrink-0 rounded bg-brand-background flex items-center justify-center text-[10px] font-black border transition-colors ${selectedChild?._id === child._id ? 'border-parent-primary text-parent-primary shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'border-brand-border text-slate-500 group-hover:border-slate-500 group-hover:text-slate-300'}`}>
                      {child.firstName[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-[11px] font-black uppercase tracking-wider leading-none mb-1 truncate ${selectedChild?._id === child._id ? 'text-white' : 'text-slate-400'} italic font-outfit`}>{child.firstName}</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none italic">Grade {child?.standard?.level || "N/A"}</p>
                    </div>
                    {selectedChild?._id === child._id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-parent-primary shadow-[0_0_10px_rgba(244,63,94,1)]" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Primary Matrix</p>
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
                  className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-parent-primary text-black shadow-lg shadow-parent-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <Icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-parent-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit">{item.label}</span>
                  {isActive(item.to) && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isExpanded ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <Icon size={18} className={isExpanded ? 'text-parent-primary' : 'group-hover:text-parent-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-parent-primary' : 'opacity-40'}`} />
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
                            className={`flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-parent-primary bg-parent-primary/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                          >
                            <ChildIcon size={16} className={`transition-opacity ${childActive ? 'opacity-100 text-parent-primary' : 'opacity-60 group-hover:opacity-100'}`} />
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
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-parent-primary/10 hover:text-parent-primary transition-all group font-outfit uppercase tracking-widest text-[11px] font-black border border-transparent hover:border-parent-primary/20">
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-parent-primary italic">Parent Center Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-parent-primary text-black border-parent-primary shadow-xl shadow-parent-primary/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-parent-primary hover:border-parent-primary/40'}`}
              >
                <Bell size={18} />
                {notifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-parent-primary rounded-md border-2 border-brand-surface animate-pulse"></span>}
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="Parent" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-parent-primary uppercase tracking-[0.4em] mt-1.5 opacity-80 leading-none italic">ID: 00{user?._id.toString().slice(-3)}</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-parent-primary transition-all p-0.5 uppercase">
                  {user?.firstName[0]}{user?.lastName[0]}
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
                          <User size={18} className="text-parent-primary" />
                          View Profile
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-parent-primary/10 text-parent-primary transition-all text-[10px] font-black uppercase tracking-widest group italic"
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

        {/* This section scrolls */}
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

export default ParentLayout;
