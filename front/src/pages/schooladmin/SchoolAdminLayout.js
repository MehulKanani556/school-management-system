import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  Calendar, MessageSquare, Menu, Bell, LogOut, ChevronDown, ChevronRight, User, Settings,
  ClipboardList, BookMarked, Globe, CreditCard, Shield, Clock, Trash2, Megaphone, Activity, DollarSign,
  Layout, PhoneIncoming, UserPlus, CalendarCheck, Brain, Banknote, Rocket, CalendarDays, BarChart3,
  FileText,
  ShieldCheck,
  Award,
  Bus,
  History,
  Truck,
  Map,
  Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import NotificationPanel from '../../components/NotificationPanel';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/school-admin', icon: LayoutDashboard, label: 'Control Center', end: true },
  {
    label: 'Academic Node',
    icon: GraduationCap,
    children: [
      { to: '/school-admin/students', icon: Users, label: 'Student Registry' },
      { to: '/school-admin/teachers', icon: GraduationCap, label: 'Teacher Corps' },
      { to: '/school-admin/classes', icon: BookOpen, label: 'Class Matrix' },
      { to: '/school-admin/subjects', icon: BookMarked, label: 'Subject Nodes' },
      { to: '/school-admin/timetable', icon: Clock, label: 'Temporal Grid' },
      { to: '/school-admin/academic-years', icon: Calendar, label: 'Session Cycles' },
    ]
  },
  {
    label: 'Admissions',
    icon: PhoneIncoming,
    children: [
       { to: '/school-admin/admissions', icon: UserPlus, label: 'Enrolment Pipeline' },
    ]
  },
  {
     label: 'Registry & Intel',
    icon: ClipboardList,
    children: [
        { to: '/school-admin/attendance', icon: CalendarCheck, label: 'Attendance Log' },
      { to: '/school-admin/attendance-intelligence', icon: Brain, label: 'Neural Analytics' },
      { to: '/school-admin/exams', icon: ClipboardList, label: 'Evaluation Ledger' },
      { to: '/school-admin/assignments', icon: FileText, label: 'Assignment Intel' },
      { to: '/school-admin/holidays', icon: Calendar, label: 'Sector Breaks' },
      
    ]
  },
  {
    label: 'Fiscal Matrix',
    icon: CreditCard,
    children: [
      { to: '/school-admin/fees', icon: CreditCard, label: 'Revenue Streams' },
      { to: '/school-admin/payroll', icon: Banknote, label: 'Staff Payroll' },
    ]
  },
  {
    label: 'Staff Core',
    icon: Rocket,
    children: [
        { to: '/school-admin/staff', icon: Users, label: 'Personnel List' },
      // { to: '/school-admin/teachers', icon: GraduationCap, label: 'Personnel List' },
      { to: '/school-admin/staff-attendance', icon: CalendarCheck, label: 'Attendance Registry' },
      { to: '/school-admin/staff-attendance-report', icon: BarChart3, label: 'Workforce Reports' },
      { to: '/school-admin/leaves', icon: CalendarDays, label: 'Leave Requests' },
      { to: '/school-admin/reviews', icon: Rocket, label: 'Performance Analytics' },
    ]
  },
  {
    label: 'Logistics Hub',
    icon: Truck,
    children: [
      { to: '/school-admin/vehicles', icon: Bus, label: 'Fleet Inventory' },
      { to: '/school-admin/transport-routes', icon: Map, label: 'Vector Networks' },
      { to: '/school-admin/trip-logs', icon: Activity, label: 'Transit Sequences' },
      { to: '/school-admin/drivers', icon: Users, label: 'Operator Registry' },
      { to: '/school-admin/student-transport-assignment', icon: UserPlus, label: 'Entity Allocation' },
    ]
  },
  {
    label: 'Library Archive',
    icon: Library,
    children: [
      { to: '/school-admin/library-inventory', icon: BookMarked, label: 'Asset Repository' },
      { to: '/school-admin/library-records', icon: ClipboardList, label: 'Circulation Logs' },
      { to: '/school-admin/library-history', icon: History, label: 'Historical Data' },
      { to: '/school-admin/library-categories', icon: BookOpen, label: 'Taxonomy Matrix' },
    ]
  },
  {
    label: 'Credential Hub',
    icon: ShieldCheck,
    children: [
      { to: '/school-admin/certificate-hub', icon: Award, label: 'Identity & Credits' },
    ]
  },
  {
    label: 'Communications',
    icon: MessageSquare,
    children: [
      { to: '/school-admin/notifications', icon: Bell, label: 'Signal Inbox' },
      { to: '/school-admin/communication?tab=announcements', icon: Megaphone, label: 'Pulse Broadcast' },
      { to: '/school-admin/communication?tab=messages', icon: MessageSquare, label: 'Direct Probe' },
      { to: '/school-admin/communication?tab=notices', icon: Layout, label: 'Notice Board' },
    ]
  },
  { to: '/school-admin/holidays', icon: Calendar, label: 'Global Breaks' },
  { to: '/school-admin/reports', icon: BarChart3, label: 'Global Analytics' },
];

const SchoolAdminLayout = () => {
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
      toast.success(`System Alert: ${notif.title}`, {
        icon: '⚡',
        style: {
          borderRadius: '1.5rem',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #0ea5e9',
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/school-admin/profile');
    setShowProfileMenu(false);
  };

  const toggleSubmenu = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  // const isActive = (path) => location.pathname === path;
  const isActive = (path) => {
    if (path.includes('?')) {
        return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
      {/* Sidebar - Terminal Aesthetic with Admin Theme */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border/60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-full`}>
        <div className="p-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-schooladmin-primary to-schooladmin-secondary flex items-center justify-center font-black text-xl italic shadow-lg">AM</div>
            <span className="text-xl font-black tracking-tight uppercase font-outfit text-white">Admin <span className="text-schooladmin-primary">Node</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Operations Control</p>
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
                  className={`flex items-center gap-4 px-6 py-4 rounded-md transition-all duration-300 group ${isActive(item.to) ? 'bg-schooladmin-primary text-black shadow-lg shadow-schooladmin-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <Icon size={18} className={isActive(item.to) ? 'text-black' : 'group-hover:text-schooladmin-primary transition-colors'} />
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
                  <Icon size={18} className={isExpanded ? 'text-schooladmin-primary' : 'group-hover:text-schooladmin-primary transition-colors'} />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] font-outfit flex-1 text-left">{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-schooladmin-primary' : 'opacity-40'}`} />
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
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.to);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-300 group ${childActive ? 'text-schooladmin-primary bg-schooladmin-primary/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                            >
                              <ChildIcon size={16} className={`transition-opacity ${childActive ? 'opacity-100 text-schooladmin-primary' : 'opacity-60 group-hover:opacity-100'}`} />
                              <span className="font-black text-[10px] uppercase tracking-[0.15em] font-outfit">{child.label}</span>
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
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-md text-slate-500 hover:bg-schooladmin-primary/10 hover:text-schooladmin-primary transition-all group font-outfit uppercase tracking-widest text-[11px] font-black border border-transparent hover:border-schooladmin-primary/20">
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-schooladmin-primary italic">Admin Center Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-md border transition-all relative ${isNotifOpen ? 'bg-schooladmin-primary text-black border-schooladmin-primary shadow-xl shadow-schooladmin-primary/20 scale-110' : 'bg-brand-background border-brand-border text-slate-400 hover:text-schooladmin-primary hover:border-schooladmin-primary/40 shadow-inner'}`}
              >
                <Bell size={18} />
                {notifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-schooladmin-primary rounded-md border-2 border-brand-surface animate-pulse"></span>}
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role="SchoolAdmin" />
            </div>

            <div className="h-10 w-px bg-brand-border/60"></div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white italic tracking-tighter uppercase font-outfit leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] font-black text-schooladmin-primary uppercase tracking-[0.4em] opacity-80 leading-none italic">ID: 00{user?._id.toString().slice(-3)}</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-background border border-brand-border overflow-hidden flex items-center justify-center shadow-xl hover:ring-2 hover:ring-schooladmin-primary transition-all p-0.5">
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
                          <User size={18} className="text-schooladmin-primary" />
                          View Profile
                        </button>

                        <div className="p-1 mb-1">
                          <div className="h-px bg-brand-border w-full" />
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-rose-500/10 text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest group italic"
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

export default SchoolAdminLayout;
