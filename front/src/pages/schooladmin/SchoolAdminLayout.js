import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CreditCard, ClipboardList, CalendarCheck, LogOut,
  MessageSquare, Menu, X, User, ChevronRight, BookMarked, Calendar, Clock,
  Banknote, CalendarDays, Rocket, BarChart3, PieChart, TrendingUp, Brain, Settings, ChevronDown, Megaphone, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainHeader from '../../components/MainHeader';
import { resetUnreadCount } from '../../redux/slice/communication.slice';

const navItems = [
  { to: '/school-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  {
    label: 'Academic',
    icon: GraduationCap,
    children: [
      { to: '/school-admin/students', icon: Users, label: 'Students' },
      { to: '/school-admin/teachers', icon: GraduationCap, label: 'Teachers' },
      { to: '/school-admin/classes', icon: BookOpen, label: 'Classes' },
      { to: '/school-admin/subjects', icon: BookMarked, label: 'Subjects' },
      { to: '/school-admin/timetable', icon: Clock, label: 'Timetable' },
    ]
  },
  {
    label: 'Exams & Attendance',
    icon: ClipboardList,
    children: [
      { to: '/school-admin/attendance', icon: CalendarCheck, label: 'Registry' },
      { to: '/school-admin/attendance-intelligence', icon: Brain, label: 'Attendance Intel' },
      { to: '/school-admin/exams', icon: ClipboardList, label: 'Exam Center' },
      { to: '/school-admin/holidays', icon: Calendar, label: 'Academic Calendar' },
    ]
  },
  {
    label: 'Financials',
    icon: CreditCard,
    children: [
      { to: '/school-admin/fees', icon: CreditCard, label: 'Fee Management' },
      { to: '/school-admin/payroll', icon: Banknote, label: 'Payroll' },
    ]
  },
  {
    label: 'Staff Management',
    icon: Rocket,
    children: [
      { to: '/school-admin/staff', icon: Users, label: 'Staff Registry' },
      { to: '/school-admin/leaves', icon: CalendarDays, label: 'Leave Requests' },
      { to: '/school-admin/reviews', icon: Rocket, label: 'Performance Reviews' },
    ]
  },
  {
    label: 'Communication',
    icon: MessageSquare,
    children: [
      { to: '/school-admin/communication?tab=announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/school-admin/communication?tab=messages', icon: MessageSquare, label: 'Direct Probe' },
      { to: '/school-admin/communication?tab=notices', icon: Layout, label: 'Notice Board' },
    ]
  },
  { to: '/school-admin/reports', icon: BarChart3, label: 'Global Analytics' },
];

const SchoolAdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.communication);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    // Auto-expand menu based on current path + search
    const activeParent = navItems.find(item =>
      item.children?.some(child => 
        location.pathname + location.search === child.to || 
        (child.to.includes('?') && location.pathname === child.to.split('?')[0] && location.search === child.to.split('?')[1])
      )
    );
    if (activeParent) setExpanded(activeParent.label);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSubmenu = (label) => {
    setExpanded(expanded === label ? null : label);
  };

  return (
    <div className="h-screen overflow-hidden bg-brand-background text-white flex font-inter">
      {/* Sidebar */}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-brand-surface/80 backdrop-blur-2xl border-r border-brand-border/40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl shadow-black/40`}>
        {/* Logo */}
        <div className="px-7 py-8 flex items-center justify-between border-b border-brand-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-black text-lg italic shadow-lg">SM</div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest font-outfit">School Admin</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Management Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const hasChildren = !!item.children;
            const isExpanded = expanded === item.label;
            const Icon = item.icon;

            if (!hasChildren) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-md transition-all duration-300 group ${isActive
                      ? 'bg-brand-primary text-white shadow-[0_8px_25px_-10px_rgba(37,99,235,0.6)]'
                      : 'text-slate-500 hover:bg-slate-800/40 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-md transition-all duration-300 ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-brand-primary/10'}`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-black text-sm uppercase tracking-wider font-outfit flex-1">{item.label}</span>
                      <ChevronRight size={14} className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'}`} />
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-md transition-all duration-300 group ${isExpanded ? 'text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                    }`}
                >
                  <div className={`p-2 rounded-md transition-all duration-300 ${isExpanded ? 'bg-brand-primary/20 text-brand-primary' : 'bg-transparent group-hover:bg-brand-primary/10'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-wider font-outfit text-left flex-1">{item.label}</span>
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
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => {
                              const active = child.to.includes('?') 
                                ? (location.pathname + location.search === child.to)
                                : isActive;
                              
                              return `flex items-center gap-3 px-5 py-3 rounded-md transition-all duration-300 group ${active ? 'text-brand-primary bg-brand-primary/10 font-bold' : 'text-slate-500 hover:text-slate-300'
                              }`;
                            }}
                          >
                            {({ isActive }) => {
                              const active = child.to.includes('?') 
                                ? (location.pathname + location.search === child.to)
                                : isActive;
                              return (
                                <>
                                  <ChildIcon size={16} className={`transition-opacity ${active ? 'opacity-100 text-brand-primary' : 'opacity-60 group-hover:opacity-100'}`} />
                                  <span className="font-black text-[11px] uppercase tracking-[0.15em] font-outfit">{child.label}</span>
                                </>
                              );
                            }}
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-4 py-6 border-t border-brand-border/30 bg-brand-surface/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-md border border-white/5 shadow-inner">
            {user?.photo ? (
              <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-md object-cover ring-2 ring-brand-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                <User size={18} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate font-outfit uppercase tracking-tighter">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] text-brand-accent font-black uppercase tracking-[0.2em] opacity-80 leading-tight">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2.5 rounded-md hover:bg-luxury-rose/10 text-slate-500 hover:text-luxury-rose transition-all group active:scale-90">
              <LogOut size={16} className="group-hover:-rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">

        {/* Main Header */}
        <MainHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminLayout;
